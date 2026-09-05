---
name: vetria:gerente-enviar-relatorio
description: Monta um relatório (acompanhamento de meta por período ou ranking de um indicador) a partir de dna/indicadores/ e envia pelo canal configurado, com confirmação antes de enviar.
allowed-tools: Read, Bash
model: sonnet
---

# Gerente IA. Enviar Relatório

Executa imediatamente: lê os indicadores da empresa ativa e envia um resumo pelo canal configurado. Sem agendamento — para automatizar o envio, use a skill `schedule` para agendar este comando.

## Passo 1. Verificar canal configurado

Este comando envia para o **destino de grupo** (a equipe toda vê). Leia `.env`. Verifique `GERENTE_CANAL_RELATORIO`.

- **Vazio ou ausente:** acione a skill `configurar-canal-relatorio`. Quando ela terminar e gravar `GERENTE_CANAL_RELATORIO`, retorne aqui.
- **`TELEGRAM`:** verifique `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID_GRUPO`. Se faltar algum, acione a skill `configurar-telegram`, depois retorne.
- **`WHATSAPP`:** verifique `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN`, `GERENTE_WHATSAPP_TIPO_GRUPO`, `GERENTE_WHATSAPP_DESTINO_GRUPO`. Se faltar algum, acione a skill `configurar-whatsapp`, depois retorne.

## Passo 2. Ler as corridas vigentes

Leia `minhas-empresas/.ativa`. Leia `minhas-empresas/{ativa}/dna/indicadores/corridas.csv`.

Se não existir ou só tiver o cabeçalho: informe que não há nenhuma meta ou corrida cadastrada, oriente a preencher `dna/indicadores/COMO-PREENCHER.md` (seção `corridas.csv`). Encerre.

Filtre as linhas cujo intervalo (`periodo_inicio` a `periodo_fim`) inclui a data de hoje.

- **Nenhuma vigente:** mostre as mais recentes (vigentes ou não) e pergunte qual usar, ou se quer informar um período manualmente.
- **Uma vigente:** confirme rapidamente em vez de fazer o usuário escolher: "Vou montar o relatório de {nome} ({periodo}). Confirma?"
- **Mais de uma vigente, sendo exatamente uma com `metrica = valor`** (acompanhamento de meta) **e uma ou mais com `metrica = pa`, `tm` ou `pm`** (ranking): monte um **relatório combinado** por padrão — a de `valor` é a principal, seguida de uma seção de ranking para cada corrida de ranking vigente. Não peça pra escolher; confirme rapidamente: "Vou montar o relatório combinado: meta de {nome da corrida valor} + ranking de {nome(s) das corridas de ranking}. Confirma?" (ver formato combinado no Passo 4).
- **Mais de uma vigente, em qualquer outra combinação** (ex: duas de `valor`, ou duas+ de ranking sem nenhuma `valor`): liste todas e pergunte, incluindo a opção de combinar:

```
Qual relatório você quer enviar?

0. Combinar todas em uma mensagem só
1. {nome da corrida 1} ({metrica}, {periodo_inicio} a {periodo_fim})
2. {nome da corrida 2} ({metrica}, {periodo_inicio} a {periodo_fim})
...

Digite o número:
```

## Passo 3. Ler os indicadores do período

Leia `minhas-empresas/{ativa}/dna/indicadores/vendas.csv`.

Se não existir ou só tiver o cabeçalho: informe que não há dados de vendas registrados, oriente a preencher `dna/indicadores/COMO-PREENCHER.md`. Encerre.

Leia também `dna/indicadores/vendedores.json` (se existir) — pra saber o `emoji` e o `valorVendasPessoal` de cada vendedor, usados no Passo 4. Isso não entra em nenhuma soma de meta coletiva, é só usado pra decidir o ícone e se a linha de aviso pessoal aparece ou não.

Filtre as linhas de `vendas.csv` dentro do período da corrida escolhida (no relatório combinado, repita esse filtro para o período de cada corrida incluída — normalmente é o mesmo período, mas trate cada uma independente). Para cada vendedor, some `valor`, `tickets`, `pecas_liquidas`, `clientes_atendidos` de todas as linhas dele no período. A partir dessas somas, calcule:
- PA = `pecas_liquidas / tickets`
- TM (ticket médio) = `valor / tickets`
- PM (venda média por atendimento) = `valor / clientes_atendidos`

Ignore vendedores sem nenhum ticket no período (evita divisão por zero). Nunca invente números que não estejam nos arquivos — se não houver nenhuma linha de vendas no período de alguma corrida, informe isso em vez de montar uma seção vazia (no combinado, informe isso só na seção daquela corrida específica, e monte normalmente as demais).

### Divisão em semanas (só pra corridas de `metrica = valor`)

Além do total do período inteiro, calcule também o progresso da **semana atual** — dá ao vendedor uma etapa mais próxima e alcançável em vez de só a meta do período inteiro (útil sobretudo quando o período é o mês inteiro). Regra padrão de divisão — **é uma sugestão nossa, não uma regra fixa**: se o gerente pedir outra divisão numa conversa, siga o que ele pedir em vez desta regra.

- Semanas são de segunda a domingo.
- A primeira semana do período vai de `periodo_inicio` até o domingo seguinte (pode sobrar uma semana curta, ex: período começando numa terça-feira sobram só 6 dias até domingo).
- Se esse primeiro pedaço tiver **menos de 4 dias**, junte com a semana seguinte (vira uma semana só, maior); com **4 dias ou mais**, ele já é uma semana própria.
- Aplique a mesma regra no pedaço final do período (se `periodo_fim` cair no meio de uma semana e sobrar menos de 4 dias até lá, junte com a semana anterior).
- Daí em diante, semanas cheias de segunda a domingo.

Identifique em qual semana a data de hoje cai. Para cada vendedor, some `valor` só dentro das datas dessa semana (mesmo filtro de `vendas.csv`, restrito a essas datas). Calcule a meta da semana proporcionalmente: `meta individual do vendedor (ver definição abaixo) × (dias desta semana ÷ dias totais do período da corrida)`.

### Dica do dia (só pra corridas de `metrica = valor`)

Pra cada vendedor, monte uma dica curta e acionável, nesta ordem de prioridade:

1. **Indicador fraco + data comemorativa da semana, combinados**: se o vendedor tiver PA, TM ou PM visivelmente abaixo da meta da corrida (ou da média da equipe, se não houver meta cadastrada pra esse indicador) **e** houver uma data comemorativa em `dna/marketing/calendario-{AAAA-MM}.md` (coluna "Tema / Data") dentro da semana atual, combine os dois: use a data como gancho e desenhe a sugestão pra atacar especificamente o indicador fraco. Exemplo real: P.A. baixo (vendedor não emplaca item adicional na venda) + "Dia da Amiga" na semana → "Hoje é Dia da Amiga! Que tal sugerir dois pares iguais, um pra ela e um pra melhor amiga? Elas vão amar usar iguais e ainda rir juntas." Isso aumenta P.A. (mais peças por atendimento) e usa o gancho do dia ao mesmo tempo. Adapte o mecanismo ao indicador certo: P.A. baixo → sugestão de item extra/par/combo; TM baixo → sugestão de subir pra uma peça de maior valor; PM baixo → sugestão ligada a atrair mais atendimentos no dia.
2. **Só indicador fraco** (sem data comemorativa relevante na semana): dica direta sobre esse indicador, sem o gancho de data.
3. **Só data comemorativa** (indicadores da pessoa estão bem): dica de venda ou de relacionamento ligada à data, sem forçar em cima de um indicador que já está bom. Não invente cliente específica (o sistema não tem cadastro de cliente, só de vendas) — fale em termos gerais, ex: "Dia do Profissional de Educação Física essa semana, que tal lembrar as clientes de presentear as personal trainers delas?"
4. **Nenhum dos dois**: reforço positivo curto e genérico, sem soar forçado.

Tom sempre leve, nunca de cobrança — é sugestão, não meta extra. Uma frase só, direto ao ponto.

## Passo 4. Montar a mensagem

O formato depende da `metrica` da corrida escolhida.

**Ícone de cada vendedor**: use o `emoji` cadastrado em `vendedores.json` (campo `emoji`), quando preenchido. Sem `emoji` cadastrado, use um fallback por gênero do primeiro nome — 👩 para nomes femininos, 👨 para nomes masculinos, 🧑 só se o nome for realmente ambíguo/unissex e não der pra inferir com confiança. Use esse ícone em todos os formatos abaixo, sempre imediatamente antes do nome do vendedor.

**Se `metrica = valor`** (acompanhamento de meta de faturamento). Siga este formato (baseado no modelo real da loja — não altere a estrutura):

```
📊 Acompanhamento da Meta - {nome da corrida, ex: "1º Período"}

📅 Período: {DD/MM} a {DD/MM}

🎯 Meta por vendedor: R$ {meta_por_vendedor da corrida}

Feito até o momento:

{ícone} {vendedor}
💰 Vendido no período: R$ {soma valor do período inteiro}
📈 Faltam R$ {meta individual do vendedor - vendido, nunca negativo — ver nota} para atingir a meta.
{se a meta individual do vendedor (linha abaixo) for maior que a "Meta por vendedor" do cabeçalho: 📌 Meta pessoal (R$ {valorVendasPessoal formatado}), maior que a cota dividida — segue por essa}

📅 Esta semana ({DD/MM} a {DD/MM})
💰 Vendido: R$ {soma valor da semana atual, ver Passo 3}
🎯 Meta da semana: R$ {meta da semana, só o valor, sem explicar a conta}
📈 Faltam R$ {meta da semana - vendido da semana, nunca negativo — ver nota} para a meta desta semana.

💡 Dica de hoje: {dica, ver critério no Passo 3}

(repita para cada vendedor)

{se houver `premio` na corrida: 🏁 Premiação: {premio}}

🔥 {linha motivacional curta, adaptada ao tom de comunicação da empresa (Workbook DNA)}

Bora pra cima, equipe! 💪🚀
```

**Meta individual do vendedor** (achado real, 2026-09-03): não é sempre igual ao `meta_por_vendedor` do cabeçalho — é o **maior valor** entre `meta_por_vendedor` da corrida e o `valorVendasPessoal` desse vendedor em `vendedores.json` (se estiver preenchido). Dividir a cota igual entre todo mundo pode gerar uma fatia menor que o mínimo pessoal já estabelecido de alguém — nesse caso, a pessoa segue pelo próprio mínimo, não pela fatia diluída. Use essa meta individual (não o valor do cabeçalho) pra calcular "Faltam" de cada vendedor, tanto do período inteiro quanto da semana (proporcionalmente, ver Passo 3). O cabeçalho "Meta por vendedor" continua mostrando o valor-base da divisão, pra dar a referência da conta coletiva.

Nota: se algum vendedor já bateu a própria meta individual do período (vendido ≥ meta individual dele), troque a linha "Faltam" do período por algo como "🏆 Meta batida! Superou em R$ {vendido - meta individual}." — nunca mostre "faltam" negativo. Mesma lógica pra semana: se já bateu a meta da semana, troque a linha "Faltam" da semana por "🏆 Meta da semana batida! Superou em R$ {diferença}."

**Se `metrica = pa`, `tm` ou `pm`** (ranking). Siga este formato:

```
📊 Ranking de {P.A. / Ticket Médio / Venda Média, conforme a metrica} – {nome da corrida}

{se meta_por_vendedor estiver preenchida: 🎯 Meta: {valor}}

{ordene do maior para o menor indicador, use medalha nos 3 primeiros — o ícone do vendedor (ver Passo 4, "Ícone de cada vendedor") vem junto com o nome, não substitui a medalha}
🥇 {ícone} {vendedor 1}: {indicador} {"✅" se meta_por_vendedor preenchida e ele bateu}
🥈 {ícone} {vendedor 2}: {indicador}
🥉 {ícone} {vendedor 3}: {indicador}
{vendedor 4 em diante, sem medalha: "{número}. {ícone} {vendedor}: {indicador}"}

{se houver `premio` na corrida: 🏁 Premiação: {premio}}

{linha de parabéns pro primeiro colocado}
{linha motivacional pros demais, sem tom negativo — foco em "ainda dá tempo", nunca em cobrança}
```

**Relatório combinado** (quando há uma corrida de `valor` + uma ou mais de ranking vigentes ao mesmo tempo, ou o usuário escolheu "combinar"): uma única mensagem, com o bloco de "Acompanhamento da Meta" primeiro, depois cada bloco de "Ranking de {métrica}" — sem o cabeçalho `📊` repetido nem linha motivacional em cada bloco (fica só uma vez no fim). Separe os blocos assim:

```
📊 Acompanhamento da Meta - {nome da corrida de valor}

{resto do bloco de meta, igual ao formato acima, sem a linha motivacional final}

➖➖➖➖➖➖➖➖

🏆 Ranking de {métrica} - {nome da corrida de ranking}

{resto do bloco de ranking, igual ao formato acima, sem a linha motivacional final}

(repita o separador + bloco de ranking pra cada corrida de ranking incluída)

🔥 {uma única linha motivacional pro conjunto todo}

Bora pra cima, equipe! 💪🚀
```

Em todos os formatos: nunca inclua julgamento negativo sobre ninguém. Adapte o tom (mais formal ou mais descontraído) ao que o Workbook DNA da empresa define em "Tom de comunicação", ou ao que o usuário pedir na hora.

## Passo 4.5. Gerar a versão ilustrada

Todo relatório é conteúdo de "relatório" (não dia a dia) — sempre vai ilustrado, com a identidade visual da própria loja, seguindo o Passo 2d de `.claude/skills/gerar-imagem/SKILL.md`. Monte o HTML com o conteúdo real da mensagem do Passo 4 (meta/vendido/faltam por vendedor, ranking com destaque pros 3 primeiros, linha motivacional), renderize e salve em `entregas/gestao/apresentacoes/relatorio-{corrida ou período}-{AAAA-MM-DD}.png`.

Sem `VETRIA_EXE_PATH` disponível: siga sem imagem, só com o texto do Passo 4 normalmente — sem bloquear a entrega.

## Passo 5. Confirmar envio

```
Relatório pronto:

{prévia da mensagem}

Enviar para {destino legível}?

1. Sim, enviar agora
2. Não, só mostrar aqui
```

Se opção 2: encerre sem chamar nenhuma API. Se a imagem do Passo 4.5 foi gerada, mostre-a aqui no chat antes de perguntar (referencie `entregas/gestao/apresentacoes/{arquivo}.png` puro na resposta — abre em tela cheia automaticamente).

## Passo 6. Enviar

O envio depende de `GERENTE_CANAL_RELATORIO`. A mensagem do Passo 4 vira legenda da imagem quando ela existe; sem imagem, segue como texto puro, igual sempre foi.

**Se `TELEGRAM`, com imagem gerada:**

Leia `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID_GRUPO` do `.env`. Salve a legenda num arquivo temporário:

```bash
TMPFILE=$(mktemp)
cat > "$TMPFILE" <<'EOF'
{MENSAGEM}
EOF
curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto" \
  -F "chat_id=${TELEGRAM_CHAT_ID_GRUPO}" \
  -F "caption=<${TMPFILE}" \
  -F "photo=@${CAMINHO_PNG}"
rm "$TMPFILE"
```

**Se `TELEGRAM`, sem imagem (fallback):**

```bash
TMPFILE=$(mktemp)
cat > "$TMPFILE" <<'EOF'
{MENSAGEM}
EOF
curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${TELEGRAM_CHAT_ID_GRUPO}" \
  --data-urlencode "text@${TMPFILE}"
rm "$TMPFILE"
```

**Se `WHATSAPP`, com imagem gerada:**

Leia `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN`, `GERENTE_WHATSAPP_DESTINO_GRUPO` do `.env`. A Z-API espera a imagem como base64/data URI, então use um script Node curto (leia os valores do `.env` dentro do próprio script, nunca literal no comando):

```bash
node -e '
const https = require("https");
const fs = require("fs");
function lerEnv(chave) {
  const c = fs.readFileSync(".env", "utf8");
  const m = new RegExp(`^${chave}=(.*)$`, "m").exec(c);
  return m ? m[1].trim() : null;
}
const instanceId = lerEnv("ZAPI_INSTANCE_ID");
const token = lerEnv("ZAPI_TOKEN");
const clientToken = lerEnv("ZAPI_CLIENT_TOKEN");
const phone = lerEnv("GERENTE_WHATSAPP_DESTINO_GRUPO");
const img = fs.readFileSync(process.argv[1]).toString("base64");
const caption = process.argv[2];
const body = JSON.stringify({ phone, image: `data:image/png;base64,${img}`, caption });
const req = https.request(
  `https://api.z-api.io/instances/${instanceId}/token/${token}/send-image`,
  { method: "POST", headers: { "Content-Type": "application/json", "Client-Token": clientToken } },
  (res) => { let d=""; res.on("data", c=>d+=c); res.on("end", () => console.log(res.statusCode, d.slice(0,300))); }
);
req.write(body);
req.end();
' "${CAMINHO_PNG}" "{MENSAGEM}"
```

**Se `WHATSAPP`, sem imagem (fallback):**

```bash
TMPFILE=$(mktemp)
cat > "$TMPFILE" <<'EOF'
{
  "phone": "${GERENTE_WHATSAPP_DESTINO_GRUPO}",
  "message": "{MENSAGEM}"
}
EOF
curl -s -X POST "https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text" \
  -H "Content-Type: application/json" \
  -H "Client-Token: ${ZAPI_CLIENT_TOKEN}" \
  --data-binary "@${TMPFILE}"
rm "$TMPFILE"
```

Nunca imprima Token, Client-Token ou Bot Token no chat. Nunca passe credenciais como argumento de linha de comando.

## Passo 7. Resultado

**Se Telegram:**
- Sucesso (`"ok":true`): informe "Relatório enviado."
- 401/"Unauthorized": token inválido, oriente a rodar `/configurar-telegram`.
- `"chat not found"`: Chat ID errado, oriente a rodar `/configurar-telegram`.

**Se WhatsApp:**
- Sucesso: informe "Relatório enviado."
- `"connected":false`: WhatsApp desconectado, oriente a rodar `/configurar-whatsapp`.
- `"subscribe to this instance again"`: assinatura Z-API expirada, oriente a renovar em app.z-api.io.

Em qualquer sucesso: registre em `minhas-empresas/{ativa}/memoria/gerente-ia.md` qual relatório e período foram enviados (evita reenvio duplicado do mesmo período no mesmo dia). Qualquer outro erro: mostre o retorno bruto para diagnóstico.
