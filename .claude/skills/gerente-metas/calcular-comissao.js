#!/usr/bin/env node
// Calculadora de comissão por vendedor, com a regra que a loja cadastrou em
// config-metas.md: três percentuais (antes da meta, ao bater a meta, ao bater
// a super). A faixa é definida pela meta individual de cada vendedor e o
// percentual da faixa vale sobre todas as vendas dele no período. O mês pode ser
// dividido em períodos (corridas de faturamento), cada um com meta e faixa próprias;
// sem períodos cadastrados, o mês inteiro é um período só.
// Uso: node calcular-comissao.js [AAAA-MM] [--slug nome] [--raiz caminho]
// Só lê arquivos; imprime um resumo em JSON.

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
const mes = args.find((a) => /^\d{4}-(0[1-9]|1[0-2])$/.test(a)) || hojeSP.slice(0, 7)

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

let configMetas = ''
try { configMetas = fs.readFileSync(path.join(ind, 'config-metas.md'), 'utf8') } catch { configMetas = '' }
const campoConfig = (rotulo) => { const m = new RegExp('^' + rotulo + ':[ \\t]*(.*)$', 'm').exec(configMetas); return m ? m[1].trim() : null }
const taxa = (rotulo) => {
  const v = campoConfig(rotulo)
  if (!v) return null
  const m = /(\d+(?:[.,]\d+)?)/.exec(v)
  return m ? Number(m[1].replace(',', '.')) : null
}

const liga = norm((campoConfig('Bonificação ligada à meta') || '').split(/\s/)[0])
if (liga !== 'sim') {
  sair({
    status: 'nao_configurada',
    mes,
    mensagem: liga === 'nao'
      ? 'A loja informou que não tem comissão ou bonificação ligada à meta.'
      : 'A loja ainda não informou a regra de comissão (configuração de metas).',
  })
}
const pctAntes = taxa('Comissão antes da meta')
const pctMeta = taxa('Comissão ao bater a meta')
const pctSuper = taxa('Comissão ao bater a super')
if (pctAntes === null || pctMeta === null) {
  sair({ status: 'sem_percentual', mes, mensagem: 'Faltam os percentuais de comissão (antes da meta e ao bater a meta) na configuração de metas.' })
}
const faixaPor = norm(campoConfig('Faixa definida pela meta') || 'individual')
const efeito = norm(campoConfig('Percentual vale sobre') || 'todas as vendas do mes')
if (!faixaPor.startsWith('individual') || !efeito.startsWith('todas')) {
  sair({
    status: 'regra_nao_suportada',
    mes,
    mensagem: 'A calculadora só sabe a regra "faixa pela meta individual de cada vendedor, percentual sobre todas as vendas dele no período". A regra cadastrada é outra.',
    regra_cadastrada: { faixa_definida_pela_meta: campoConfig('Faixa definida pela meta'), percentual_vale_sobre: campoConfig('Percentual vale sobre') },
  })
}

const linhaMeta = lerCsv(path.join(ind, 'meta-mensal-loja.csv')).find((l) => l.mes === mes)
const metaLoja = linhaMeta ? dinheiro(linhaMeta.meta_loja) : 0
const metaSuperLoja = linhaMeta ? dinheiro(linhaMeta.meta_super) : 0
if (!(metaLoja > 0)) sair({ status: 'sem_meta', mes, mensagem: 'Não há meta cadastrada para este mês.' })

let vendedoresJson = []
try { vendedoresJson = JSON.parse(fs.readFileSync(path.join(ind, 'vendedores.json'), 'utf8')) } catch { vendedoresJson = [] }
const ativos = (Array.isArray(vendedoresJson) ? vendedoresJson : []).filter((v) => v && v.ativo === true && v.nome)
if (!ativos.length) sair({ status: 'sem_vendedores', mes, mensagem: 'Não há vendedores ativos cadastrados.' })

const donoDoNome = {}
for (const v of ativos) {
  donoDoNome[norm(v.nome)] = v.nome
  for (const a of Array.isArray(v.nomesAnteriores) ? v.nomesAnteriores : []) donoDoNome[norm(a)] = v.nome
}

const [anoM, mesM] = mes.split('-').map(Number)
const diasNoMes = new Date(Date.UTC(anoM, mesM, 0)).getUTCDate()
const diaSemanaDe = (d) => new Date(Date.UTC(anoM, mesM - 1, d)).getUTCDay()
const isoDoDia = (d) => mes + '-' + String(d).padStart(2, '0')
const paraIso = (s) => {
  const t = String(s || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t)
  return m ? m[3] + '-' + m[2] + '-' + m[1] : null
}

// Vendas por vendedor cadastrado e por dia.
const vendasPorDia = {}
const foraDoCadastro = {}
const totalPorData = {}
for (const l of lerCsv(path.join(ind, 'vendas.csv'))) {
  const v = Number(l.valor)
  if (!l.data || l.data.slice(0, 7) !== mes || !Number.isFinite(v)) continue
  totalPorData[l.data] = (totalPorData[l.data] || 0) + v
  const dono = donoDoNome[norm(l.vendedor)]
  if (dono) {
    if (!vendasPorDia[dono]) vendasPorDia[dono] = {}
    vendasPorDia[dono][l.data] = (vendasPorDia[dono][l.data] || 0) + v
  } else foraDoCadastro[l.vendedor] = (foraDoCadastro[l.vendedor] || 0) + v
}
const datasComVenda = Object.keys(totalPorData).filter((d) => totalPorData[d] > 0).sort()
if (!datasComVenda.length) sair({ status: 'sem_vendas', mes, mensagem: 'Ainda não há vendas lançadas neste mês.' })
const dataRef = datasComVenda[datasComVenda.length - 1]
const diaRef = Number(dataRef.slice(8, 10))

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
const pesoTotalMes = Object.values(peso).reduce((a, b) => a + b, 0)
const somaPeso = (de, ate, filtro) => { let s = 0; for (let d = de; d <= ate; d++) if (!filtro || filtro(d)) s += peso[d]; return s }

const escalaPor = {}
for (const l of lerCsv(path.join(ind, 'escala-' + mes + '.csv'))) escalaPor[norm(l.vendedor)] = l
const trabalha = (nome, d) => { const l = escalaPor[norm(nome)]; return !l || String(l[String(d)] || '').trim() === '' }

// Períodos do mês: as corridas de faturamento (metrica=valor) que cobrem parte
// do mês. Se houver períodos menores que o mês, valem só eles; se houver só a
// meta do mês inteiro, ela é o único período; sem nada, o mês inteiro.
const primeiroIso = isoDoDia(1)
const ultimoIso = isoDoDia(diasNoMes)
const corridasMes = lerCsv(path.join(ind, 'corridas.csv'))
  .filter((l) => norm(l.metrica) === 'valor')
  .map((l) => ({ nome: l.nome || 'Período', ini: paraIso(l.periodo_inicio), fim: paraIso(l.periodo_fim), metaPorVendedor: dinheiro(l.meta_por_vendedor) }))
  .filter((c) => c.ini && c.fim && c.ini <= c.fim && c.fim >= primeiroIso && c.ini <= ultimoIso)
  .sort((a, b) => (a.ini < b.ini ? -1 : 1))
const menoresQueOMes = corridasMes.filter((c) => !(c.ini <= primeiroIso && c.fim >= ultimoIso))
let periodosBase
if (menoresQueOMes.length) periodosBase = menoresQueOMes
else if (corridasMes.length) periodosBase = [corridasMes[0]]
else periodosBase = [{ nome: 'Mês inteiro', ini: primeiroIso, fim: ultimoIso, metaPorVendedor: 0 }]
const periodos = periodosBase.map((c) => ({
  nome: c.nome,
  diaIni: c.ini <= primeiroIso ? 1 : Number(c.ini.slice(8, 10)),
  diaFim: c.fim >= ultimoIso ? diasNoMes : Number(c.fim.slice(8, 10)),
  metaPorVendedor: c.metaPorVendedor,
}))

const fatorSuper = metaSuperLoja > 0 ? metaSuperLoja / metaLoja : null
const faixaDe = (valor, metaInd, superInd) => (superInd && valor >= superInd ? 'super' : valor >= metaInd ? 'meta' : 'antes')
const pctDaFaixa = (f) => (f === 'super' ? (pctSuper !== null ? pctSuper : pctMeta) : f === 'meta' ? pctMeta : pctAntes)

const totais = {}
for (const v of ativos) totais[v.nome] = { vendedor: v.nome, comissao_acumulada: 0, comissao_projetada: 0, vendido_fora_dos_periodos: 0 }

const resultadoPeriodos = periodos.map((p) => {
  const pesoPeriodo = somaPeso(p.diaIni, p.diaFim)
  const situacao = diaRef < p.diaIni ? 'futuro' : diaRef >= p.diaFim ? 'encerrado' : 'em_andamento'
  const metaBaseInd = p.metaPorVendedor > 0 ? p.metaPorVendedor : ((metaLoja * pesoPeriodo) / (pesoTotalMes || 100)) / ativos.length
  const linhas = ativos.map((v) => {
    const pisoMes = Number(v.valorVendasPessoal)
    const piso = Number.isFinite(pisoMes) && pisoMes > 0 ? (pisoMes * pesoPeriodo) / (pesoTotalMes || 100) : 0
    const metaInd = Math.max(metaBaseInd, piso)
    const superInd = fatorSuper && pctSuper !== null ? metaInd * fatorSuper : null
    let vendido = 0
    for (let d = p.diaIni; d <= p.diaFim; d++) vendido += (vendasPorDia[v.nome] && vendasPorDia[v.nome][isoDoDia(d)]) || 0
    const base = {
      vendedor: v.nome,
      meta_individual: arred2(metaInd),
      meta_super_individual: superInd ? arred2(superInd) : null,
    }
    if (situacao === 'futuro') return { ...base, vendido: 0, observacao: 'período ainda não começou' }
    const faixa = faixaDe(vendido, metaInd, superInd)
    const comissaoHoje = (vendido * pctDaFaixa(faixa)) / 100
    let fracao = null
    let projecao = null
    let faixaProj = null
    let comissaoProj = comissaoHoje
    if (situacao === 'em_andamento') {
      const pesoPeriodoVend = somaPeso(p.diaIni, p.diaFim, (d) => trabalha(v.nome, d))
      const pesoAteRef = somaPeso(p.diaIni, diaRef, (d) => trabalha(v.nome, d))
      fracao = pesoPeriodoVend > 0 ? pesoAteRef / pesoPeriodoVend : null
      projecao = fracao ? vendido / fracao : null
      faixaProj = projecao === null ? null : faixaDe(projecao, metaInd, superInd)
      comissaoProj = projecao === null ? comissaoHoje : (projecao * pctDaFaixa(faixaProj)) / 100
    }
    totais[v.nome].comissao_acumulada += comissaoHoje
    totais[v.nome].comissao_projetada += comissaoProj
    return {
      ...base,
      vendido: arred2(vendido),
      percentual_da_meta: arred2((vendido / metaInd) * 100),
      faltam_para_meta: arred2(Math.max(0, metaInd - vendido)),
      faltam_para_super: superInd ? arred2(Math.max(0, superInd - vendido)) : null,
      faixa_atual: faixa,
      percentual_de_comissao_atual: pctDaFaixa(faixa),
      comissao_se_fechasse_hoje: arred2(comissaoHoje),
      comissao_no_minimo_ao_bater_a_meta: arred2((metaInd * pctMeta) / 100),
      ...(situacao === 'em_andamento'
        ? {
            fracao_esperada_do_periodo_ate_a_data: fracao === null ? null : arred2(fracao * 100),
            projecao_fim_do_periodo: projecao === null ? null : arred2(projecao),
            faixa_projetada: faixaProj,
            comissao_projetada: arred2(comissaoProj),
          }
        : {}),
    }
  })
  return { nome: p.nome, inicio: isoDoDia(p.diaIni), fim: isoDoDia(p.diaFim), situacao, vendedores: linhas }
})

// Vendas do mês que caíram fora de qualquer período cadastrado não rendem comissão.
for (const v of ativos) {
  let total = 0
  for (const dia of Object.keys(vendasPorDia[v.nome] || {})) total += vendasPorDia[v.nome][dia]
  let dentro = 0
  for (const p of periodos) for (let d = p.diaIni; d <= p.diaFim; d++) dentro += (vendasPorDia[v.nome] && vendasPorDia[v.nome][isoDoDia(d)]) || 0
  totais[v.nome].vendido_fora_dos_periodos = arred2(total - dentro)
}
const totaisLista = Object.values(totais).map((t) => ({ ...t, comissao_acumulada: arred2(t.comissao_acumulada), comissao_projetada: arred2(t.comissao_projetada) }))

sair({
  status: 'ok',
  mes,
  data_referencia: dataRef,
  percentuais: { antes_da_meta: pctAntes, ao_bater_a_meta: pctMeta, ao_bater_a_super: pctSuper },
  usa_pesos_aprovados: usaPesos,
  periodos: resultadoPeriodos,
  totais_por_vendedor: totaisLista,
  total_comissao_acumulada: arred2(totaisLista.reduce((s, t) => s + t.comissao_acumulada, 0)),
  total_comissao_projetada: arred2(totaisLista.reduce((s, t) => s + t.comissao_projetada, 0)),
  vendas_de_quem_nao_esta_no_cadastro: Object.keys(foraDoCadastro).map((n) => ({ nome: n, vendido: arred2(foraDoCadastro[n]) })),
  premissas: [
    'Cada período do mês (corridas de faturamento cadastradas) tem a sua meta, a sua faixa e a sua comissão; a comissão do mês é a soma dos períodos. Sem períodos cadastrados, o mês inteiro é um período só.',
    'A faixa de cada vendedor em cada período é definida pela meta individual dele naquele período: a meta por vendedor da corrida (ou a meta do mês dividida pelos vendedores ativos, pelo peso dos dias do período) ou a meta pessoal proporcional, o que for maior.',
    fatorSuper && pctSuper !== null ? 'A meta super individual é a meta individual do período multiplicada pela proporção entre a meta super e a cota da loja (' + arred2(fatorSuper) + ').' : 'Não há meta super cadastrada para o mês, então só existem duas faixas.',
    'O percentual da faixa atingida vale sobre todas as vendas do vendedor naquele período (retroativo dentro do período).',
    'A comissão incide só sobre as vendas de cada vendedor cadastrado; vendas de quem não está no cadastro (como o e-commerce) e vendas fora dos períodos cadastrados ficam de fora.',
    'A projeção só vale para o período em andamento e supõe que o resto dele siga o ritmo esperado ' + (usaPesos ? '(pesos aprovados dos dias)' : '(dias abertos iguais)') + ', considerando as folgas de cada vendedor, a partir da venda acumulada até ' + dataRef + '. Períodos que ainda não começaram não entram na projeção.',
  ],
})
