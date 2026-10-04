#!/usr/bin/env node
// Acompanhamento da meta: mês, período atual e dia, com o ritmo necessário
// considerando os dias que faltam e os pesos deles (pesos aprovados, ou dias
// iguais entre os dias abertos). Também resume cada vendedor no mês e no
// período.
// Uso: node acompanhamento.js [AAAA-MM-DD] [--slug nome] [--raiz caminho]
// A data padrão é hoje (fuso de São Paulo). Só lê arquivos; imprime JSON.

const fs = require('fs')
const path = require('path')

function sair(obj, codigo) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n')
  process.exit(codigo || 0)
}
const falhar = (mensagem) => sair({ status: 'erro', mensagem }, 1)

const args = process.argv.slice(2)
const valorDe = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null }
const raiz = valorDe('--raiz') || process.cwd()
const hojeSP = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
const data = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || hojeSP
const mes = data.slice(0, 7)

let slug = valorDe('--slug')
if (!slug) { try { slug = fs.readFileSync(path.join(raiz, 'minhas-empresas', '.ativa'), 'utf8').trim() } catch { slug = '' } }
if (!slug) falhar('Não encontrei a empresa ativa (minhas-empresas/.ativa).')
const ind = path.join(raiz, 'minhas-empresas', slug, 'dna', 'indicadores')
if (!fs.existsSync(ind)) falhar('Não encontrei a pasta de indicadores da empresa.')

function parseLinha(linha) {
  const campos = []
  let atual = ''
  let aspas = false
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i]
    if (aspas) {
      if (c === '"') { if (linha[i + 1] === '"') { atual += '"'; i++ } else aspas = false } else atual += c
    } else if (c === '"') aspas = true
    else if (c === ',') { campos.push(atual); atual = '' }
    else atual += c
  }
  campos.push(atual)
  return campos
}
function lerCsv(arquivo) {
  let texto
  try { texto = fs.readFileSync(arquivo, 'utf8') } catch { return [] }
  const brutas = texto.split(/\r?\n/).filter((l) => l.trim() !== '')
  if (!brutas.length) return []
  const cab = parseLinha(brutas[0]).map((h) => h.trim())
  return brutas.slice(1).map((l) => {
    const campos = parseLinha(l)
    const o = {}
    cab.forEach((h, i) => { o[h] = (campos[i] || '').trim() })
    return o
  })
}
function dinheiro(v) {
  const s = String(v == null ? '' : v).trim()
  if (!s) return 0
  let t = s
  if (t.includes(',')) t = t.split('.').join('').replace(',', '.')
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.split('.').join('')
  const n = Number(t)
  return Number.isFinite(n) ? n : 0
}
const arred2 = (x) => Math.round(x * 100) / 100
const norm = (s) => String(s == null ? '' : s).trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const linhaMeta = lerCsv(path.join(ind, 'meta-mensal-loja.csv')).find((l) => l.mes === mes)
const metaLoja = linhaMeta ? dinheiro(linhaMeta.meta_loja) : 0
if (!(metaLoja > 0)) sair({ status: 'sem_meta', data, mensagem: 'Não há meta cadastrada para este mês.' })

const [anoM, mesM, diaHoje] = data.split('-').map(Number)
const diasNoMes = new Date(Date.UTC(anoM, mesM, 0)).getUTCDate()
const diaSemanaDe = (d) => new Date(Date.UTC(anoM, mesM - 1, d)).getUTCDay()
const isoDoDia = (d) => mes + '-' + String(d).padStart(2, '0')
const paraIso = (s) => {
  const t = String(s || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t)
  return m ? m[3] + '-' + m[2] + '-' + m[1] : null
}

let vendedoresJson = []
try { vendedoresJson = JSON.parse(fs.readFileSync(path.join(ind, 'vendedores.json'), 'utf8')) } catch { vendedoresJson = [] }
const ativos = (Array.isArray(vendedoresJson) ? vendedoresJson : []).filter((v) => v && v.ativo === true && v.nome)
const donoDoNome = {}
for (const v of ativos) {
  donoDoNome[norm(v.nome)] = v.nome
  for (const a of Array.isArray(v.nomesAnteriores) ? v.nomesAnteriores : []) donoDoNome[norm(a)] = v.nome
}

const vendidoDiaLoja = {}
const vendidoVendDia = {}
for (const l of lerCsv(path.join(ind, 'vendas.csv'))) {
  const v = Number(l.valor)
  if (!l.data || l.data.slice(0, 7) !== mes || !Number.isFinite(v)) continue
  vendidoDiaLoja[l.data] = (vendidoDiaLoja[l.data] || 0) + v
  const dono = donoDoNome[norm(l.vendedor)]
  if (dono) {
    if (!vendidoVendDia[dono]) vendidoVendDia[dono] = {}
    vendidoVendDia[dono][l.data] = (vendidoVendDia[dono][l.data] || 0) + v
  }
}
const somaLoja = (de, ate) => { let s = 0; for (let d = de; d <= ate; d++) s += vendidoDiaLoja[isoDoDia(d)] || 0; return s }
const somaVend = (nome, de, ate) => { let s = 0; for (let d = de; d <= ate; d++) s += (vendidoVendDia[nome] && vendidoVendDia[nome][isoDoDia(d)]) || 0; return s }

function diasAbertos() {
  let t
  try { t = fs.readFileSync(path.join(ind, 'config-escala.md'), 'utf8') } catch { return [0, 1, 2, 3, 4, 5, 6] }
  const m = /^Dias abertos:[ \t]*(.+)$/m.exec(t)
  if (!m) return [0, 1, 2, 3, 4, 5, 6]
  const mapa = { domingo: 0, segunda: 1, terca: 2, quarta: 3, quinta: 4, sexta: 5, sabado: 6 }
  const dias = m[1].split(',').map((s) => mapa[norm(s).replace(/-feira$/, '')]).filter((i) => i !== undefined)
  return dias.length ? dias : [0, 1, 2, 3, 4, 5, 6]
}
const abertos = diasAbertos()
const pesosAprovados = lerCsv(path.join(ind, 'pesos-' + mes + '.csv'))
const usaPesos = pesosAprovados.some((l) => l.aprovado === 'sim')
const peso = {}
for (let d = 1; d <= diasNoMes; d++) peso[d] = 0
if (usaPesos) {
  for (const l of pesosAprovados) { const d = Number(l.dia); if (d >= 1 && d <= diasNoMes && l.aprovado === 'sim') peso[d] = Number(l.peso_pct) || 0 }
} else {
  const lista = []
  for (let d = 1; d <= diasNoMes; d++) if (abertos.indexOf(diaSemanaDe(d)) >= 0) lista.push(d)
  for (const d of lista) peso[d] = 100 / lista.length
}
const pesoTotal = Object.values(peso).reduce((a, b) => a + b, 0) || 100
const somaPeso = (de, ate, filtro) => { let s = 0; for (let d = de; d <= ate; d++) if (!filtro || filtro(d)) s += peso[d]; return s }

const escalaPor = {}
for (const l of lerCsv(path.join(ind, 'escala-' + mes + '.csv'))) escalaPor[norm(l.vendedor)] = l
const trabalha = (nome, d) => { const l = escalaPor[norm(nome)]; return !l || String(l[String(d)] || '').trim() === '' }

// Período atual: o definido na configuração de metas (semanas, corridas ou
// mês); sem nada informado, as corridas de faturamento menores que o mês, e
// sem elas as semanas.
let configMetas = ''
try { configMetas = fs.readFileSync(path.join(ind, 'config-metas.md'), 'utf8') } catch { configMetas = '' }
const mPer = /^Períodos de apuração:[ \t]*(.*)$/m.exec(configMetas)
const textoPer = norm(mPer ? mPer[1] : '')
let modoPeriodos = textoPer.startsWith('semana') ? 'semanas' : textoPer.startsWith('mes') ? 'mes' : textoPer.startsWith('corrida') ? 'corridas' : 'auto'

function semanasDoMes() {
  const blocos = []
  let ini = 1
  for (let d = 1; d <= diasNoMes; d++) {
    if (diaSemanaDe(d) === 0 || d === diasNoMes) { blocos.push({ ini, fim: d }); ini = d + 1 }
  }
  if (blocos.length > 1 && blocos[0].fim - blocos[0].ini + 1 < 4) { blocos[1].ini = blocos[0].ini; blocos.shift() }
  const u = blocos.length - 1
  if (blocos.length > 1 && blocos[u].fim - blocos[u].ini + 1 < 4) { blocos[u - 1].fim = blocos[u].fim; blocos.pop() }
  return blocos
}
const primeiroIso = isoDoDia(1)
const ultimoIso = isoDoDia(diasNoMes)
const corridasMes = lerCsv(path.join(ind, 'corridas.csv'))
  .filter((l) => norm(l.metrica) === 'valor')
  .map((l) => ({ nome: l.nome || 'Período', ini: paraIso(l.periodo_inicio), fim: paraIso(l.periodo_fim), metaPorVendedor: dinheiro(l.meta_por_vendedor) }))
  .filter((c) => c.ini && c.fim && c.ini <= c.fim && c.fim >= primeiroIso && c.ini <= ultimoIso)
  .sort((a, b) => (a.ini < b.ini ? -1 : 1))
const corridasMenores = corridasMes.filter((c) => !(c.ini <= primeiroIso && c.fim >= ultimoIso))
if (modoPeriodos === 'auto') modoPeriodos = corridasMenores.length ? 'corridas' : 'semanas'
let periodos
if (modoPeriodos === 'corridas') {
  const base = corridasMenores.length ? corridasMenores : corridasMes.slice(0, 1)
  periodos = base.length
    ? base.map((c) => ({ nome: c.nome, diaIni: c.ini <= primeiroIso ? 1 : Number(c.ini.slice(8, 10)), diaFim: c.fim >= ultimoIso ? diasNoMes : Number(c.fim.slice(8, 10)), metaPorVendedor: c.metaPorVendedor }))
    : [{ nome: 'Mês inteiro', diaIni: 1, diaFim: diasNoMes, metaPorVendedor: 0 }]
} else if (modoPeriodos === 'mes') {
  periodos = [{ nome: 'Mês inteiro', diaIni: 1, diaFim: diasNoMes, metaPorVendedor: 0 }]
} else {
  periodos = semanasDoMes().map((b, i) => ({ nome: (i + 1) + 'ª semana', diaIni: b.ini, diaFim: b.fim, metaPorVendedor: 0 }))
}
const periodoAtual = periodos.find((p) => diaHoje >= p.diaIni && diaHoje <= p.diaFim) || null

const nAtivos = ativos.length || 1
const abertoHoje = peso[diaHoje] > 0
const diasRestantesMes = []
for (let d = diaHoje; d <= diasNoMes; d++) if (peso[d] > 0) diasRestantesMes.push(d)

// Mês
const realizadoMes = somaLoja(1, diasNoMes)
const restanteMes = Math.max(0, metaLoja - realizadoMes)
const pesoRestanteMes = somaPeso(diaHoje, diasNoMes)
const mes_ = {
  meta: arred2(metaLoja),
  realizado: arred2(realizadoMes),
  percentual_atingido: arred2((realizadoMes / metaLoja) * 100),
  restante: arred2(restanteMes),
  dias_de_funcionamento_restantes: diasRestantesMes.length,
}

// Dia
const metaDia = (metaLoja * peso[diaHoje]) / pesoTotal
const realizadoDia = vendidoDiaLoja[data] || 0
const dia_ = {
  data,
  loja_aberta: abertoHoje,
  meta: arred2(metaDia),
  realizado: arred2(realizadoDia),
  percentual_atingido: metaDia > 0 ? arred2((realizadoDia / metaDia) * 100) : null,
  restante: arred2(Math.max(0, metaDia - realizadoDia)),
}

// Ritmo necessário: o que falta no mês, distribuído pelos dias que restam
// segundo o peso de cada um (hoje incluído).
const ritmo_ = {
  restante_do_mes: arred2(restanteMes),
  dias_de_funcionamento_restantes: diasRestantesMes.length,
  necessario_por_dia_em_media: diasRestantesMes.length ? arred2(restanteMes / diasRestantesMes.length) : null,
  necessario_hoje_considerando_os_pesos: pesoRestanteMes > 0 && abertoHoje ? arred2((restanteMes * peso[diaHoje]) / pesoRestanteMes) : null,
}

// Período atual
let periodo_ = null
if (periodoAtual) {
  const pesoPeriodo = somaPeso(periodoAtual.diaIni, periodoAtual.diaFim)
  const metaPeriodo = periodoAtual.metaPorVendedor > 0 ? periodoAtual.metaPorVendedor * nAtivos : (metaLoja * pesoPeriodo) / pesoTotal
  const realizadoPeriodo = somaLoja(periodoAtual.diaIni, periodoAtual.diaFim)
  const restantePeriodo = Math.max(0, metaPeriodo - realizadoPeriodo)
  const pesoRestantePeriodo = somaPeso(diaHoje, periodoAtual.diaFim)
  const diasRest = []
  for (let d = diaHoje; d <= periodoAtual.diaFim; d++) if (peso[d] > 0) diasRest.push(d)
  periodo_ = {
    nome: periodoAtual.nome,
    inicio: isoDoDia(periodoAtual.diaIni),
    fim: isoDoDia(periodoAtual.diaFim),
    meta: arred2(metaPeriodo),
    realizado: arred2(realizadoPeriodo),
    percentual_atingido: metaPeriodo > 0 ? arred2((realizadoPeriodo / metaPeriodo) * 100) : null,
    restante: arred2(restantePeriodo),
    dias_de_funcionamento_restantes: diasRest.length,
    necessario_por_dia_em_media: diasRest.length ? arred2(restantePeriodo / diasRest.length) : null,
    necessario_hoje_considerando_os_pesos: pesoRestantePeriodo > 0 && abertoHoje ? arred2((restantePeriodo * peso[diaHoje]) / pesoRestantePeriodo) : null,
  }
}

// Vendedores: mês e período (meta individual = a maior entre a fatia da cota e
// a meta pessoal proporcional, como no restante da Vetria).
const vendedores = ativos.map((v) => {
  const pisoMes = Number(v.valorVendasPessoal)
  const piso = Number.isFinite(pisoMes) && pisoMes > 0 ? pisoMes : 0
  const metaMesInd = Math.max(metaLoja / nAtivos, piso)
  const vendidoMes = somaVend(v.nome, 1, diasNoMes)
  const linha = {
    vendedor: v.nome,
    trabalha_hoje: trabalha(v.nome, diaHoje),
    mes: { meta: arred2(metaMesInd), realizado: arred2(vendidoMes), percentual_atingido: arred2((vendidoMes / metaMesInd) * 100), restante: arred2(Math.max(0, metaMesInd - vendidoMes)) },
  }
  if (periodoAtual) {
    const pesoPeriodo = somaPeso(periodoAtual.diaIni, periodoAtual.diaFim)
    const baseP = periodoAtual.metaPorVendedor > 0 ? periodoAtual.metaPorVendedor : ((metaLoja * pesoPeriodo) / pesoTotal) / nAtivos
    const metaP = Math.max(baseP, (piso * pesoPeriodo) / pesoTotal)
    const vendidoP = somaVend(v.nome, periodoAtual.diaIni, periodoAtual.diaFim)
    linha.periodo = { meta: arred2(metaP), realizado: arred2(vendidoP), percentual_atingido: arred2((vendidoP / metaP) * 100), restante: arred2(Math.max(0, metaP - vendidoP)) }
  }
  return linha
})

sair({
  status: 'ok',
  data,
  usa_pesos_aprovados: usaPesos,
  periodos_de_apuracao: modoPeriodos,
  mes: mes_,
  periodo_atual: periodo_,
  dia: dia_,
  ritmo: ritmo_,
  vendedores,
  premissas: [
    'A meta do dia e o ritmo necessário seguem ' + (usaPesos ? 'os pesos aprovados dos dias' : 'dias abertos iguais (nenhum peso aprovado para o mês)') + '.',
    'O ritmo necessário distribui o que falta no mês pelos dias de funcionamento que restam, hoje incluído, de acordo com o peso de cada dia. O realizado de hoje, se houver, já está descontado.',
    'A meta individual de cada vendedor é a maior entre a fatia da cota (dividida pelos vendedores ativos) e a meta pessoal proporcional.',
  ],
})
