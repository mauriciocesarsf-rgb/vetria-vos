#!/usr/bin/env node
// Compara o previsto (pesos dos dias) com o realizado (vendas) de um mês, e a
// sugestão original da Vetria com o que o gestor aprovou. Só recomenda: nunca
// altera nenhuma regra da loja. Com --registrar, guarda o resultado do mês em
// dna/indicadores/historico-metas.csv (uma linha por mês, atualizada se já existir).
// Uso: node previsto-realizado.js [AAAA-MM] [--registrar] [--slug nome] [--raiz caminho]

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
const registrar = args.includes('--registrar')
const hojeSP = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
const mes = args.find((a) => /^\d{4}-(0[1-9]|1[0-2])$/.test(a)) || hojeSP.slice(0, 7)
const DIA_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

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
if (!(metaLoja > 0)) sair({ status: 'sem_meta', mes, mensagem: 'Não há meta cadastrada para este mês.' })

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

const vendaDia = {}
for (const l of lerCsv(path.join(ind, 'vendas.csv'))) {
  const v = Number(l.valor)
  if (!l.data || l.data.slice(0, 7) !== mes || !Number.isFinite(v)) continue
  vendaDia[l.data] = (vendaDia[l.data] || 0) + v
}
const datasComVenda = Object.keys(vendaDia).filter((d) => vendaDia[d] > 0).sort()
if (!datasComVenda.length) sair({ status: 'sem_vendas', mes, mensagem: 'Ainda não há vendas lançadas neste mês.' })
const dataRef = datasComVenda[datasComVenda.length - 1]
const diaRef = Number(dataRef.slice(8, 10))
const realizadoMes = Object.values(vendaDia).reduce((a, b) => a + b, 0)
const vendaDoDia = (d) => vendaDia[isoDoDia(d)] || 0

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
function pesosDe(linhas, soAprovado) {
  const p = {}
  for (let d = 1; d <= diasNoMes; d++) p[d] = 0
  for (const l of linhas) {
    const d = Number(l.dia)
    if (d >= 1 && d <= diasNoMes && (!soAprovado || l.aprovado === 'sim')) p[d] = Number(l.peso_pct) || 0
  }
  return p
}
const linhasAprovadas = lerCsv(path.join(ind, 'pesos-' + mes + '.csv'))
const usaAprovados = linhasAprovadas.some((l) => l.aprovado === 'sim')
let pesoAprov
if (usaAprovados) pesoAprov = pesosDe(linhasAprovadas, true)
else {
  pesoAprov = {}
  const lista = []
  for (let d = 1; d <= diasNoMes; d++) if (abertos.indexOf(diaSemanaDe(d)) >= 0) lista.push(d)
  for (let d = 1; d <= diasNoMes; d++) pesoAprov[d] = lista.indexOf(d) >= 0 ? 100 / lista.length : 0
}
const linhasSugeridas = lerCsv(path.join(ind, 'pesos-' + mes + '-sugerido.csv'))
const temSugestao = linhasSugeridas.length > 0
const pesoSug = temSugestao ? pesosDe(linhasSugeridas, false) : null

// Comparação sempre até a data de referência, com previsto e realizado
// renormalizados nesse trecho (serve para mês fechado e para mês em andamento).
const somaAte = (obj, f) => { let s = 0; for (let d = 1; d <= diaRef; d++) s += f(obj, d); return s }
const vendaAte = somaAte(null, (_, d) => vendaDoDia(d))
const norma = (pesos) => { const t = somaAte(pesos, (p, d) => p[d]); const r = {}; for (let d = 1; d <= diaRef; d++) r[d] = t > 0 ? (pesos[d] / t) * 100 : 0; return r }
const prevAprovNorm = norma(pesoAprov)
const prevSugNorm = pesoSug ? norma(pesoSug) : null
const realNorm = {}
for (let d = 1; d <= diaRef; d++) realNorm[d] = vendaAte > 0 ? (vendaDoDia(d) / vendaAte) * 100 : 0
const mae = (prev) => {
  let s = 0
  let n = 0
  for (let d = 1; d <= diaRef; d++) { if (prev[d] > 0 || realNorm[d] > 0) { s += Math.abs(prev[d] - realNorm[d]); n++ } }
  return n ? s / n : null
}
const maeAprov = mae(prevAprovNorm)
const maeSug = prevSugNorm ? mae(prevSugNorm) : null

// Por dia da semana
const porDia = []
for (let w = 1; w <= 7; w++) {
  const i = w % 7
  let prev = 0
  let real = 0
  let n = 0
  for (let d = 1; d <= diaRef; d++) if (diaSemanaDe(d) === i && abertos.indexOf(i) >= 0) { prev += prevAprovNorm[d]; real += realNorm[d]; n++ }
  if (!n) continue
  porDia.push({ dia: DIA_SEMANA[i], dias_comparados: n, previsto_pct: arred2(prev), realizado_pct: arred2(real), realizado_sobre_previsto_pct: prev > 0 ? arred2((real / prev) * 100) : null })
}

// Períodos (semanas do mês, ou as corridas de faturamento cadastradas)
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
let configMetas = ''
try { configMetas = fs.readFileSync(path.join(ind, 'config-metas.md'), 'utf8') } catch { configMetas = '' }
const mPer = /^Períodos de apuração:[ \t]*(.*)$/m.exec(configMetas)
const textoPer = norm(mPer ? mPer[1] : '')
const primeiroIso = isoDoDia(1)
const ultimoIso = isoDoDia(diasNoMes)
const corridasMenores = lerCsv(path.join(ind, 'corridas.csv'))
  .filter((l) => norm(l.metrica) === 'valor')
  .map((l) => ({ nome: l.nome || 'Período', ini: paraIso(l.periodo_inicio), fim: paraIso(l.periodo_fim) }))
  .filter((c) => c.ini && c.fim && c.ini <= c.fim && c.fim >= primeiroIso && c.ini <= ultimoIso && !(c.ini <= primeiroIso && c.fim >= ultimoIso))
  .sort((a, b) => (a.ini < b.ini ? -1 : 1))
let periodos
if (textoPer.startsWith('corrida') || (!textoPer.startsWith('semana') && !textoPer.startsWith('mes') && corridasMenores.length)) {
  periodos = corridasMenores.map((c) => ({ nome: c.nome, diaIni: c.ini <= primeiroIso ? 1 : Number(c.ini.slice(8, 10)), diaFim: c.fim >= ultimoIso ? diasNoMes : Number(c.fim.slice(8, 10)) }))
}
if (!periodos || !periodos.length) {
  periodos = textoPer.startsWith('mes') ? [{ nome: 'Mês inteiro', diaIni: 1, diaFim: diasNoMes }] : semanasDoMes().map((b, i) => ({ nome: (i + 1) + 'ª semana', diaIni: b.ini, diaFim: b.fim }))
}
const pesoTotalMes = Object.values(pesoAprov).reduce((a, b) => a + b, 0) || 100
const porPeriodo = periodos.filter((p) => p.diaIni <= diaRef).map((p) => {
  const fim = Math.min(p.diaFim, diaRef)
  let prevPct = 0
  let realPct = 0
  for (let d = p.diaIni; d <= fim; d++) { prevPct += prevAprovNorm[d]; realPct += realNorm[d] }
  let pesoP = 0
  let realP = 0
  for (let d = p.diaIni; d <= p.diaFim; d++) pesoP += pesoAprov[d]
  for (let d = p.diaIni; d <= fim; d++) realP += vendaDoDia(d)
  const metaP = (metaLoja * pesoP) / pesoTotalMes
  return {
    periodo: p.nome,
    inicio: isoDoDia(p.diaIni),
    fim: isoDoDia(p.diaFim),
    encerrado: p.diaFim <= diaRef,
    previsto_pct_do_trecho: arred2(prevPct),
    realizado_pct_do_trecho: arred2(realPct),
    meta: arred2(metaP),
    realizado: arred2(realP),
    atingimento_pct: metaP > 0 ? arred2((realP / metaP) * 100) : null,
  }
})

const desvios = []
for (let d = 1; d <= diaRef; d++) desvios.push({ data: isoDoDia(d), previsto_pct: arred2(prevAprovNorm[d]), realizado_pct: arred2(realNorm[d]), diferenca_pp: arred2(realNorm[d] - prevAprovNorm[d]) })
desvios.sort((a, b) => Math.abs(b.diferenca_pp) - Math.abs(a.diferenca_pp))

// O que o gestor mudou em relação à sugestão original
let alteradosPeloGestor = null
if (temSugestao && usaAprovados) {
  alteradosPeloGestor = []
  for (let d = 1; d <= diasNoMes; d++) {
    const dif = pesoAprov[d] - pesoSug[d]
    if (Math.abs(dif) >= 0.5) alteradosPeloGestor.push({ data: isoDoDia(d), sugerido_pct: arred2(pesoSug[d]), aprovado_pct: arred2(pesoAprov[d]), diferenca_pp: arred2(dif) })
  }
}

let maisProxima = null
if (maeSug !== null && usaAprovados && maeAprov !== null) maisProxima = Math.abs(maeSug - maeAprov) < 0.01 ? 'empate' : maeSug < maeAprov ? 'sugerida' : 'aprovada'

// Observações objetivas (só fatos; quem recomenda é o comando)
const observacoes = []
for (const p of porDia) {
  if (p.dias_comparados >= 3 && p.realizado_sobre_previsto_pct !== null && Math.abs(p.realizado_sobre_previsto_pct - 100) >= 15) {
    observacoes.push(p.dia + ': o realizado ficou em ' + p.realizado_sobre_previsto_pct + '% do que o peso previa (' + p.dias_comparados + ' dias comparados).')
  }
}
for (const p of porPeriodo) {
  if (p.atingimento_pct !== null && p.encerrado) observacoes.push(p.periodo + ' (encerrado): atingimento de ' + p.atingimento_pct + '% da meta do período.')
}
if (maisProxima === 'sugerida') observacoes.push('A sugestão original da Vetria ficou mais próxima do realizado do que a versão aprovada (erro médio de ' + arred2(maeSug) + ' contra ' + arred2(maeAprov) + ' ponto percentual por dia).')
if (maisProxima === 'aprovada') observacoes.push('A versão aprovada ficou mais próxima do realizado do que a sugestão original (erro médio de ' + arred2(maeAprov) + ' contra ' + arred2(maeSug) + ' ponto percentual por dia).')
if (maisProxima === 'empate') observacoes.push('A sugestão original e a versão aprovada tiveram o mesmo erro médio em relação ao realizado.')
if (!temSugestao) observacoes.push('Não há sugestão original guardada para este mês, então não dá para comparar a sugestão com o que foi aprovado.')
if (!usaAprovados) observacoes.push('Não há pesos aprovados para este mês: o previsto usado foi o de dias de funcionamento iguais.')

const mesCompleto = diaRef >= diasNoMes || (() => { for (let d = diaRef + 1; d <= diasNoMes; d++) if (abertos.indexOf(diaSemanaDe(d)) >= 0) return false; return true })()

let registroFeito = false
if (registrar) {
  const cab = ['mes', 'meta_loja', 'realizado', 'atingimento_pct', 'mes_completo', 'usou_pesos_aprovados', 'tinha_sugestao', 'erro_medio_sugerido_pp', 'erro_medio_aprovado_pp', 'dias_alterados_pelo_gestor', 'registrado_em']
  const arquivo = path.join(ind, 'historico-metas.csv')
  const existentes = lerCsv(arquivo).filter((l) => l.mes !== mes)
  const nova = {
    mes,
    meta_loja: String(arred2(metaLoja)),
    realizado: String(arred2(realizadoMes)),
    atingimento_pct: String(arred2((realizadoMes / metaLoja) * 100)),
    mes_completo: mesCompleto ? 'sim' : 'nao',
    usou_pesos_aprovados: usaAprovados ? 'sim' : 'nao',
    tinha_sugestao: temSugestao ? 'sim' : 'nao',
    erro_medio_sugerido_pp: maeSug === null ? '' : String(arred2(maeSug)),
    erro_medio_aprovado_pp: maeAprov === null ? '' : String(arred2(maeAprov)),
    dias_alterados_pelo_gestor: alteradosPeloGestor ? String(alteradosPeloGestor.length) : '',
    registrado_em: new Date().toISOString(),
  }
  const todas = existentes.concat([nova]).sort((a, b) => (a.mes < b.mes ? -1 : 1))
  fs.writeFileSync(arquivo, [cab.join(',')].concat(todas.map((l) => cab.map((c) => String(l[c] == null ? '' : l[c])).join(','))).join('\n') + '\n', 'utf8')
  registroFeito = true
}

sair({
  status: 'ok',
  mes,
  comparado_ate: dataRef,
  mes_completo: mesCompleto,
  previsto_com: usaAprovados ? 'pesos aprovados' : 'dias de funcionamento iguais',
  meta_loja: arred2(metaLoja),
  realizado_no_mes: arred2(realizadoMes),
  atingimento_pct: arred2((realizadoMes / metaLoja) * 100),
  por_periodo: porPeriodo,
  por_dia_da_semana: porDia,
  maiores_desvios_por_dia: desvios.slice(0, 5),
  sugestao_original: {
    existe: temSugestao,
    erro_medio_sugerido_pp: maeSug === null ? null : arred2(maeSug),
    erro_medio_aprovado_pp: maeAprov === null ? null : arred2(maeAprov),
    mais_proxima_do_realizado: maisProxima,
    dias_alterados_pelo_gestor: alteradosPeloGestor,
  },
  observacoes,
  registrado_no_historico: registroFeito,
  premissas: [
    'Previsto e realizado são comparados como participação de cada dia no total do trecho já vendido (até ' + dataRef + '), para valer também com o mês em andamento.',
    'O erro médio é a diferença média, em pontos percentuais por dia, entre a participação prevista e a realizada.',
    'Esta comparação só recomenda: nenhuma regra da loja é alterada com base nela.',
  ],
})
