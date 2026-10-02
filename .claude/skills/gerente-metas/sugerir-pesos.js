#!/usr/bin/env node
// Sugere os pesos dos dias de um mês a partir do histórico de vendas (vendas.csv).
// Uso: node sugerir-pesos.js AAAA-MM [--refazer] [--slug nome] [--raiz caminho]
// Grava pesos-AAAA-MM.csv (rascunho, aprovado=nao) e pesos-AAAA-MM-explicacao.md
// em minhas-empresas/{empresa}/dna/indicadores/. Imprime um resumo em JSON.

const fs = require('fs')
const path = require('path')

const MIN_DIAS_MES = 20
const MIN_OBS_DIA_SEMANA = 3
const MAX_MESES = 6
const DIA_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function sair(obj, codigo) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n')
  process.exit(codigo || 0)
}
function falhar(mensagem) { sair({ status: 'erro', mensagem }, 1) }

const args = process.argv.slice(2)
const mes = args.find((a) => /^\d{4}-(0[1-9]|1[0-2])$/.test(a))
if (!mes) falhar('Informe o mês no formato AAAA-MM.')
const refazer = args.includes('--refazer')
const valorDe = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null }
const raiz = valorDe('--raiz') || process.cwd()

let slug = valorDe('--slug')
if (!slug) {
  try { slug = fs.readFileSync(path.join(raiz, 'minhas-empresas', '.ativa'), 'utf8').trim() } catch { slug = '' }
}
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
function campoCsv(v) {
  const s = String(v == null ? '' : v)
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

const [anoAlvo, mesAlvo] = mes.split('-').map(Number)
const diasNoMes = new Date(Date.UTC(anoAlvo, mesAlvo, 0)).getUTCDate()
const diaSemanaDe = (ano, m, d) => new Date(Date.UTC(ano, m - 1, d)).getUTCDay()
const rotuloMes = (chave) => { const [a, m] = chave.split('-').map(Number); return MES_CURTO[m - 1] + '/' + a }

const arquivoPesos = path.join(ind, 'pesos-' + mes + '.csv')
const arquivoExplicacao = path.join(ind, 'pesos-' + mes + '-explicacao.md')

if (!refazer) {
  const existentes = lerCsv(arquivoPesos)
  if (existentes.some((l) => l.aprovado === 'sim')) {
    sair({ status: 'ja_aprovado', mes, mensagem: 'Este mês já tem pesos aprovados. Para gerar uma nova sugestão no lugar, repita o pedido com --refazer.' })
  }
}

function dias_abertos() {
  const todos = { dias: [0, 1, 2, 3, 4, 5, 6], configurado: false }
  let texto
  try { texto = fs.readFileSync(path.join(ind, 'config-escala.md'), 'utf8') } catch { return todos }
  const m = /^Dias abertos:[ \t]*(.+)$/m.exec(texto)
  if (!m) return todos
  const mapa = { domingo: 0, segunda: 1, terca: 2, quarta: 3, quinta: 4, sexta: 5, sabado: 6 }
  const normaliza = (s) => s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/-feira$/, '')
  const dias = m[1].split(',').map((s) => mapa[normaliza(s)]).filter((i) => i !== undefined)
  return dias.length ? { dias, configurado: true } : todos
}
const abertos = dias_abertos()
const estaAberto = (w) => abertos.dias.indexOf(w) >= 0

// Total da loja por dia (soma de todas as linhas do dia, como no resto do sistema).
const totalPorData = {}
for (const l of lerCsv(path.join(ind, 'vendas.csv'))) {
  const v = Number(l.valor)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(l.data) || !Number.isFinite(v)) continue
  totalPorData[l.data] = (totalPorData[l.data] || 0) + v
}
const diasPorMes = {}
for (const data of Object.keys(totalPorData)) {
  if (totalPorData[data] <= 0) continue
  const chave = data.slice(0, 7)
  if (!diasPorMes[chave]) diasPorMes[chave] = []
  diasPorMes[chave].push({ data, total: totalPorData[data] })
}
const mesesUsados = Object.keys(diasPorMes)
  .filter((k) => k < mes && diasPorMes[k].length >= MIN_DIAS_MES)
  .sort()
  .slice(-MAX_MESES)
const nivel = mesesUsados.length ? 1 : 0

const soma = [0, 0, 0, 0, 0, 0, 0]
const obs = [0, 0, 0, 0, 0, 0, 0]
let somaGeral = 0
let obsGeral = 0
for (const k of mesesUsados) {
  for (const { data, total } of diasPorMes[k]) {
    const [a, m, d] = data.split('-').map(Number)
    const w = diaSemanaDe(a, m, d)
    soma[w] += total; obs[w]++; somaGeral += total; obsGeral++
  }
}
const mediaGeral = obsGeral ? somaGeral / obsGeral : 0
const confiavel = (w) => obs[w] >= MIN_OBS_DIA_SEMANA
const mediaDoDia = (w) => (confiavel(w) ? soma[w] / obs[w] : mediaGeral)
const fatorDoDia = (w) => (mediaGeral ? mediaDoDia(w) / mediaGeral - 1 : 0)

const bruto = []
let totalBruto = 0
for (let d = 1; d <= diasNoMes; d++) {
  const w = diaSemanaDe(anoAlvo, mesAlvo, d)
  const peso = estaAberto(w) ? (nivel ? mediaDoDia(w) : 1) : 0
  bruto.push(peso)
  totalBruto += peso
}
if (!(totalBruto > 0)) falhar('Nenhum dia aberto neste mês pelos dias de funcionamento cadastrados.')

const pesos = bruto.map((p) => Math.round((p / totalBruto) * 100 * 10000) / 10000)
let ultimoAberto = -1
for (let i = 0; i < pesos.length; i++) if (pesos[i] > 0) ultimoAberto = i
const diferenca = 100 - pesos.reduce((a, b) => a + b, 0)
pesos[ultimoAberto] = Math.round((pesos[ultimoAberto] + diferenca) * 10000) / 10000

const sinal = (f) => (f >= 0 ? '+' : '-') + Math.abs(Math.round(f * 100)) + '%'
const linhasCsv = ['dia,data,peso_pct,origem,observacao,aprovado']
for (let d = 1; d <= diasNoMes; d++) {
  const w = diaSemanaDe(anoAlvo, mesAlvo, d)
  let observacao = ''
  if (!estaAberto(w)) observacao = 'loja fechada nesse dia da semana'
  else if (nivel) observacao = confiavel(w) ? DIA_SEMANA[w] + ': ' + sinal(fatorDoDia(w)) + ' vs média (' + obs[w] + ' dias observados)' : DIA_SEMANA[w] + ': poucos dados, peso neutro'
  linhasCsv.push([d, mes + '-' + String(d).padStart(2, '0'), pesos[d - 1], nivel ? 'historico' : 'linear', observacao, 'nao'].map(campoCsv).join(','))
}
fs.writeFileSync(arquivoPesos, linhasCsv.join('\n') + '\n', 'utf8')

function dicaDoGestor() {
  let texto
  try { texto = fs.readFileSync(path.join(ind, 'config-metas.md'), 'utf8') } catch { return null }
  const m = /## Dias fortes e dias fracos\s*\n+([\s\S]*?)(?=\n## |$)/.exec(texto)
  const t = m ? m[1].trim() : ''
  return t && t[0] !== '(' ? t : null
}
const dica = dicaDoGestor()

const porDiaSemana = []
for (let w = 1; w <= 7; w++) {
  const i = w % 7
  if (!estaAberto(i)) continue
  porDiaSemana.push({ dia: DIA_SEMANA[i], fator_pct: nivel && confiavel(i) ? Math.round(fatorDoDia(i) * 100) : null, observados: obs[i] })
}

const hoje = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
const exp = []
exp.push('# Como a Vetria chegou nesta sugestão: ' + rotuloMes(mes))
exp.push('')
exp.push('Gerada em ' + hoje + '. É só uma sugestão: só vale depois que você aprovar.')
exp.push('')
if (nivel === 0) {
  exp.push('**Base:** ainda não há histórico suficiente. Para medir o ritmo dos dias da semana preciso de pelo menos 1 mês anterior a ' + rotuloMes(mes) + ' com vendas lançadas em ' + MIN_DIAS_MES + ' dias ou mais, e não encontrei. Por isso dividi a meta igualmente entre os dias abertos.')
} else {
  exp.push('**Base:** vendas de ' + mesesUsados.map(rotuloMes).join(', ') + ' (' + mesesUsados.length + ' ' + (mesesUsados.length === 1 ? 'mês completo' : 'meses completos') + ', ' + obsGeral + ' dias com venda). Para cada dia da semana calculei quanto a loja vendeu em média em relação à média geral dos dias, e o peso de cada dia do mês segue essa proporção.')
  exp.push('')
  exp.push('Em relação à média geral:')
  for (const p of porDiaSemana) {
    exp.push('- ' + p.dia + ': ' + (p.fator_pct === null ? 'poucos dados (' + p.observados + ' dias), peso neutro' : (p.fator_pct >= 0 ? '+' : '') + p.fator_pct + '% (' + p.observados + ' dias observados)'))
  }
  if (mesesUsados.length < 3) {
    exp.push('')
    exp.push('Com só ' + mesesUsados.length + (mesesUsados.length === 1 ? ' mês' : ' meses') + ' de histórico, esse padrão é uma indicação fraca. Confira e ajuste o que não bater com o que você conhece da loja.')
  }
}
if (dica) {
  exp.push('')
  exp.push('**Você me contou:** "' + dica.replace(/[.\s]+$/, '') + '".' + (nivel === 0 ? ' Sem histórico não consigo medir esse efeito; se quiser dar mais peso a esses dias, ajuste na tela.' : ' Compare com os números acima.'))
}
exp.push('')
if (!abertos.configurado) exp.push('Os dias de funcionamento não estão marcados na aba Escala, então considerei todos os dias da semana abertos.')
exp.push('Feriados em que a loja fecha, datas comemorativas e ações (como uma Black) ainda não foram consideradas. Ajuste esses dias na aba Meta por dia.')
fs.writeFileSync(arquivoExplicacao, exp.join('\n') + '\n', 'utf8')

sair({
  status: 'ok',
  mes,
  nivel,
  meses_usados: mesesUsados,
  dias_abertos_configurados: abertos.configurado,
  por_dia_semana: porDiaSemana,
  arquivo_pesos: path.relative(raiz, arquivoPesos).split(path.sep).join('/'),
  arquivo_explicacao: path.relative(raiz, arquivoExplicacao).split(path.sep).join('/'),
})
