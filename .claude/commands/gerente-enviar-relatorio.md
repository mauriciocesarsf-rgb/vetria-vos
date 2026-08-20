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

Leia também `dna/indicadores/vendedores.json` (se existir) — só pra saber o `valorVendasPessoal` de cada vendedor, usado no Passo 4. Isso não entra em nenhuma soma de meta coletiva, é só usado pra decidir se a linha de aviso pessoal aparece ou não.

Filtre as linhas de `vendas.csv` dentro do período da corrida escolhida (no relatório combinado, repita esse filtro para o período de cada corrida incluída — normalmente é o mesmo período, mas trate cada uma independente). Para cada vendedor, some `valor`, `tickets`, `pecas_liquidas`, `clientes_atendidos` de todas as linhas dele no período. A partir dessas somas, calcule:
- PA = `pecas_liquidas / tickets`
- TM (ticket médio) = `valor / tickets`
- PM (venda média por atendimento) = `valor / clientes_atendidos`

Ignore vendedores sem nenhum ticket no período (evita divisão por zero). Nunca invente números que não estejam nos arquivos — se não houver nenhuma linha de vendas no período de alguma corrida, informe isso em vez de montar uma seção vazia (no combinado, informe isso só na seção daquela corrida específica, e monte normalmente as demais).

## Passo 4. Montar a mensagem

O formato depende da `metrica` da corrida escolhida.

**Ícone de cada vendedor**: em vez de um marcador genérico, use um bonequinho de acordo com o gênero do primeiro nome — 👩 para nomes femininos, 👨 para nomes masculinos, 🧑 só se o nome for realmente ambíguo/unissex e não der pra inferir com confiança. Use esse ícone em todos os formatos abaixo, sempre imediatamente antes do nome do vendedor.

**Se `metrica = valor`** (acompanhamento de meta de faturamento). Siga este formato (baseado no modelo real da loja — não altere a estrutura):

```
📊 Acompanhamento da Meta - {nome da corrida, ex: "1º Período"}

📅 Período: {DD/MM} a {DD/MM}

🎯 Meta por vendedor: R$ {meta_por_vendedor da corrida}

Feito até o momento:

{ícone de gênero} {vendedor}
💰 Vendido: R$ {soma valor}
📈 Faltam R$ {meta - vendido, nunca negativo — ver nota} para atingir a meta.
{se valorVendasPessoal do vendedor estiver preenchido em vendedores.json e a soma dele no período < valorVendasPessoal: ⚠️ Abaixo do mínimo pessoal (R$ {valorVendasPessoal formatado}) — mostre isso como um aviso à parte, nunca reescreva ou altere a conta da meta coletiva acima}

(repita para cada vendedor)

{se houver `premio` na corrida: 🏁 Premiação: {premio}}

🔥 {linha motivacional curta, adaptada ao tom de comunicação da empresa (Workbook DNA)}

Bora pra cima, equipe! 💪🚀
```

Nota: se algum vendedor já bateu a meta (vendido ≥ meta), troque a linha "Faltam" por algo como "🏆 Meta batida! Superou em R$ {vendido - meta}." — nunca mostre "faltam" negativo.

**Se `metrica = pa`, `tm` ou `pm`** (ranking). Siga este formato:

```
📊 Ranking de {P.A. / Ticket Médio / Venda Média, conforme a metrica} – {nome da corrida}

{se meta_por_vendedor estiver preenchida: 🎯 Meta: {valor}}

{ordene do maior para o menor indicador, use medalha nos 3 primeiros — o ícone de gênero vem junto com o nome, não substitui a medalha}
🥇 {ícone de gênero} {vendedor 1}: {indicador} {"✅" se meta_por_vendedor preenchida e ele bateu}
🥈 {ícone de gênero} {vendedor 2}: {indicador}
🥉 {ícone de gênero} {vendedor 3}: {indicador}
{vendedor 4 em diante, sem medalha: "{número}. {ícone de gênero} {vendedor}: {indicador}"}

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

## Passo 5. Confirmar envio

```
Relatório pronto:

{prévia da mensagem}

Enviar para {destino legível}?

1. Sim, enviar agora
2. Não, só mostrar aqui
```

Se opção 2: encerre sem chamar nenhuma API.

## Passo 6. Enviar

O envio depende de `GERENTE_CANAL_RELATORIO`.

**Se `TELEGRAM`:**

Leia `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID_GRUPO` do `.env`. Salve a mensagem num arquivo temporário para evitar problemas de escape:

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

**Se `WHATSAPP`:**

Leia `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN`, `GERENTE_WHATSAPP_DESTINO_GRUPO` do `.env`:

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
