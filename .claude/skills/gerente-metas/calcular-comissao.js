#!/usr/bin/env node
// Calculadora de comissão por vendedor, com a regra que a loja cadastrou em
// config-metas.md: três percentuais (antes da meta, ao bater a meta, ao bater a
// super), a regra da meta super (+X% sobre a meta ou valor manual), a regra de
// recuperação (opcional) e os períodos de apuração (corridas de faturamento,
// semanas ou mês inteiro). A faixa de cada vendedor vem da meta individual dele
// em cada período e o percentual da faixa vale sobre todas as vendas dele no
// período.
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
const efeito = norm(campoConfig('Percentual vale sobre') || 'todas as vendas do periodo')
if (!faixaPor.startsWith('individual') || !efeito.startsWith('todas')) {
  sair({
    status: 'regra_nao_suportada',
    mes,
    mensagem: 'A calculadora só sabe a regra "faixa pela meta individual de cada vendedor, percentual sobre todas as vendas dele no período". A regra cadastrada é outra.',
    regra_cadastrada: { faixa_definida_pela_meta: campoConfig('Faixa definida pela meta'), percentual_vale_sobre: campoConfig('Percentual vale sobre') },
  })
}

// Regra da meta super: "+15%" (sobre a meta), "valor manual" (usa meta_super do
// mês, em proporção) ou "não tem". Sem nada informado, cai no valor manual se
// a meta super do mês estiver preenchida.
const textoSuper = norm(campoConfig('Meta super') || '')
let regraSuper = 'indefinida'
let superAcimaPct = null
if (/^(nao tem|sem super|nenhuma)/.test(textoSuper)) regraSuper = 'nenhuma'
else if (textoSuper.includes('manual')) regraSuper = 'manual'
else if (/\d/.test(textoSuper)) {
  const m = /(\d+(?:[.,]\d+)?)\s*%/.exec(textoSuper)
  if (m) { regraSuper = 'percentual'; superAcimaPct = Number(m[1].replace(',', '.')) }
}

const textoRecup = norm((campoConfig('Regra de recuperação') || '').split(/\s/)[0])
const recuperacaoAtiva = textoRecup === 'sim'
const textoPeriodos = norm(campoConfig('Períodos de apuração') || 'corridas')
const modoPeriodos = textoPeriodos.startsWith('semana') ? 'semanas' : textoPeriodos.startsWith('mes') ? 'mes' : 'corridas'

const linhaMeta = lerCsv(path.join(ind, 'meta-mensal-loja.csv')).find((l) => l.mes === mes)
const metaLoja = linhaMeta ? dinheiro(linhaMeta.meta_loja) : 0
const metaSuperLoja = linhaMeta ? dinheiro(linhaMeta.meta_super) : 0
if (!(metaLoja > 0)) sair({ status: 'sem_meta', mes, mensagem: 'Não há meta cadastrada para este mês.' })
if (regraSuper === 'indefinida') regraSuper = metaSuperLoja > 0 ? 'manual' : 'nenhuma'
if (regraSuper === 'manual' && !(metaSuperLoja > 0)) regraSuper = 'nenhuma'
const fatorSuper = regraSuper === 'percentual' ? 1 + superAcimaPct / 100 : regraSuper === 'manual' ? metaSuperLoja / metaLoja : null
const temSuper = fatorSuper !== null && pctSuper !== null

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

// Períodos de apuração: corridas de faturamento do mês (padrão), semanas
// (segunda a domingo, ponta com menos de 4 dias junta com a vizinha) ou o mês
// inteiro. Com corridas: períodos menores que o mês valem sozinhos; só a meta
// do mês inteira vale como único período; sem nada, o mês inteiro.
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
let periodos
if (modoPeriodos === 'semanas') {
  periodos = semanasDoMes().map((b, i) => ({ nome: (i + 1) + 'ª semana', diaIni: b.ini, diaFim: b.fim, metaPorVendedor: 0 }))
} else if (modoPeriodos === 'mes') {
  periodos = [{ nome: 'Mês inteiro', diaIni: 1, diaFim: diasNoMes, metaPorVendedor: 0 }]
} else {
  const corridasMes = lerCsv(path.join(ind, 'corridas.csv'))
    .filter((l) => norm(l.metrica) === 'valor')
    .map((l) => ({ nome: l.nome || 'Período', ini: paraIso(l.periodo_inicio), fim: paraIso(l.periodo_fim), metaPorVendedor: dinheiro(l.meta_por_vendedor) }))
    .filter((c) => c.ini && c.fim && c.ini <= c.fim && c.fim >= primeiroIso && c.ini <= ultimoIso)
    .sort((a, b) => (a.ini < b.ini ? -1 : 1))
  const menoresQueOMes = corridasMes.filter((c) => !(c.ini <= primeiroIso && c.fim >= ultimoIso))
  let base
  if (menoresQueOMes.length) base = menoresQueOMes
  else if (corridasMes.length) base = [corridasMes[0]]
  else base = [{ nome: 'Mês inteiro', ini: primeiroIso, fim: ultimoIso, metaPorVendedor: 0 }]
  periodos = base.map((c) => ({
    nome: c.nome,
    diaIni: c.ini <= primeiroIso ? 1 : Number(c.ini.slice(8, 10)),
    diaFim: c.fim >= ultimoIso ? diasNoMes : Number(c.fim.slice(8, 10)),
    metaPorVendedor: c.metaPorVendedor,
  }))
}

const faixaDe = (valor, metaInd, superInd) => (superInd && valor >= superInd ? 'super' : valor >= metaInd ? 'meta' : 'antes')
const pctDaFaixa = (f) => (f === 'super' ? pctSuper : f === 'meta' ? pctMeta : pctAntes)

const resultadoPeriodos = periodos.map((p) => {
  const pesoPeriodo = somaPeso(p.diaIni, p.diaFim)
  const situacao = diaRef < p.diaIni ? 'futuro' : diaRef >= p.diaFim ? 'encerrado' : 'em_andamento'
  const metaBaseInd = p.metaPorVendedor > 0 ? p.metaPorVendedor : ((metaLoja * pesoPeriodo) / (pesoTotalMes || 100)) / ativos.length
  const linhas = ativos.map((v) => {
    const pisoMes = Number(v.valorVendasPessoal)
    const piso = Number.isFinite(pisoMes) && pisoMes > 0 ? (pisoMes * pesoPeriodo) / (pesoTotalMes || 100) : 0
    const metaInd = Math.max(metaBaseInd, piso)
    const superInd = temSuper ? metaInd * fatorSuper : null
    let vendido = 0
    for (let d = p.diaIni; d <= p.diaFim; d++) vendido += (vendasPorDia[v.nome] && vendasPorDia[v.nome][isoDoDia(d)]) || 0
    const base = { vendedor: v.nome, meta_individual: arred2(metaInd), meta_super_individual: superInd ? arred2(superInd) : null }
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
      _interno: { vendido, comissaoHoje, comissaoProj, faixaProj, projecao },
    }
  })
  return { nome: p.nome, inicio: isoDoDia(p.diaIni), fim: isoDoDia(p.diaFim), situacao, vendedores: linhas }
})

// Totais por vendedor, com a regra de recuperação (opcional): se o vendedor
// bate a meta do mês, os períodos que ficaram na faixa de baixo são
// recalculados para a faixa da meta (nunca para a super).
const totaisLista = ativos.map((v) => {
  const pisoMes = Number(v.valorVendasPessoal)
  const metaMesInd = Math.max(metaLoja / ativos.length, Number.isFinite(pisoMes) && pisoMes > 0 ? pisoMes : 0)
  let vendidoMes = 0
  for (const dia of Object.keys(vendasPorDia[v.nome] || {})) vendidoMes += vendasPorDia[v.nome][dia]
  let vendidoNosPeriodos = 0
  for (const p of periodos) for (let d = p.diaIni; d <= p.diaFim; d++) vendidoNosPeriodos += (vendasPorDia[v.nome] && vendasPorDia[v.nome][isoDoDia(d)]) || 0

  const pesoMesVend = somaPeso(1, diasNoMes, (d) => trabalha(v.nome, d))
  const pesoAteRefVend = somaPeso(1, diaRef, (d) => trabalha(v.nome, d))
  const fracaoMes = pesoMesVend > 0 ? pesoAteRefVend / pesoMesVend : null
  const projecaoMes = fracaoMes ? vendidoMes / fracaoMes : null
  const atingiuMeta = vendidoMes >= metaMesInd
  const atingiriaMeta = projecaoMes !== null && projecaoMes >= metaMesInd

  let acumulada = 0
  let projetada = 0
  const recuperados = []
  for (const p of resultadoPeriodos) {
    const linha = p.vendedores.find((x) => x.vendedor === v.nome)
    if (!linha || !linha._interno) continue
    const { vendido, comissaoHoje, comissaoProj, faixaProj } = linha._interno
    let hoje = comissaoHoje
    let proj = comissaoProj
    if (recuperacaoAtiva) {
      if (linha.faixa_atual === 'antes' && atingiuMeta) {
        hoje = (vendido * pctMeta) / 100
        recuperados.push({ periodo: p.nome, comissao_antes: arred2(comissaoHoje), comissao_depois: arred2(hoje), ganho: arred2(hoje - comissaoHoje) })
      }
      const faixaFinal = p.situacao === 'em_andamento' && faixaProj ? faixaProj : linha.faixa_atual
      if (faixaFinal === 'antes' && (atingiriaMeta || atingiuMeta)) {
        const baseProj = p.situacao === 'em_andamento' && linha._interno.projecao !== null ? linha._interno.projecao : vendido
        proj = (baseProj * pctMeta) / 100
      }
    }
    linha.comissao_com_recuperacao_hoje = recuperacaoAtiva ? arred2(hoje) : undefined
    acumulada += hoje
    projetada += proj
  }
  for (const p of resultadoPeriodos) for (const l of p.vendedores) if (l.vendedor === v.nome) delete l._interno
  return {
    vendedor: v.nome,
    comissao_acumulada: arred2(acumulada),
    comissao_projetada: arred2(projetada),
    vendido_fora_dos_periodos: arred2(vendidoMes - vendidoNosPeriodos),
    ...(recuperacaoAtiva
      ? {
          recuperacao: {
            meta_mensal_individual: arred2(metaMesInd),
            vendido_no_mes: arred2(vendidoMes),
            atingiu_a_meta_do_mes: atingiuMeta,
            projecao_do_mes: projecaoMes === null ? null : arred2(projecaoMes),
            atingiria_a_meta_do_mes_na_projecao: atingiriaMeta,
            periodos_recuperados: recuperados,
          },
        }
      : {}),
  }
})

sair({
  status: 'ok',
  mes,
  data_referencia: dataRef,
  percentuais: { antes_da_meta: pctAntes, ao_bater_a_meta: pctMeta, ao_bater_a_super: pctSuper },
  regras: {
    meta_super: regraSuper === 'percentual' ? 'meta + ' + superAcimaPct + '%' : regraSuper === 'manual' ? 'valor manual do mês (proporcional)' : 'não tem',
    recuperacao: recuperacaoAtiva ? 'sim' : 'não',
    periodos_de_apuracao: modoPeriodos,
  },
  usa_pesos_aprovados: usaPesos,
  periodos: resultadoPeriodos,
  totais_por_vendedor: totaisLista,
  total_comissao_acumulada: arred2(totaisLista.reduce((s, t) => s + t.comissao_acumulada, 0)),
  total_comissao_projetada: arred2(totaisLista.reduce((s, t) => s + t.comissao_projetada, 0)),
  vendas_de_quem_nao_esta_no_cadastro: Object.keys(foraDoCadastro).map((n) => ({ nome: n, vendido: arred2(foraDoCadastro[n]) })),
  premissas: [
    'Cada período (' + (modoPeriodos === 'semanas' ? 'semanas do mês' : modoPeriodos === 'mes' ? 'o mês inteiro' : 'corridas de faturamento cadastradas, ou o mês inteiro se não houver') + ') tem a sua meta, a sua faixa e a sua comissão; a comissão do mês é a soma dos períodos.',
    'A faixa de cada vendedor em cada período é definida pela meta individual dele naquele período: a meta por vendedor da corrida (ou a meta do mês dividida pelos vendedores ativos, pelo peso dos dias do período) ou a meta pessoal proporcional, o que for maior.',
    regraSuper === 'percentual' ? 'A meta super de cada vendedor é a meta dele no período mais ' + superAcimaPct + '%, como a loja configurou.' : regraSuper === 'manual' ? 'A meta super de cada vendedor segue a proporção entre a meta super do mês e a cota da loja (' + arred2(fatorSuper) + ').' : 'Não há meta super configurada, então só existem duas faixas.',
    recuperacaoAtiva ? 'Regra de recuperação ligada: se o vendedor bate a meta do mês, os períodos que ficaram abaixo da meta passam a valer o percentual da meta (não o da super).' : 'Sem regra de recuperação: cada período vale pela faixa que atingiu.',
    'O percentual da faixa atingida vale sobre todas as vendas do vendedor naquele período.',
    'A comissão incide só sobre as vendas de cada vendedor cadastrado; vendas de quem não está no cadastro (como o e-commerce) e vendas fora dos períodos ficam de fora.',
    'A projeção só vale para o período em andamento e supõe que o resto dele siga o ritmo esperado ' + (usaPesos ? '(pesos aprovados dos dias)' : '(dias abertos iguais)') + ', considerando as folgas de cada vendedor, a partir da venda acumulada até ' + dataRef + '. Períodos que ainda não começaram não entram na projeção.',
  ],
})
