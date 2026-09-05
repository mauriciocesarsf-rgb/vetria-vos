---
name: vetria:gerente-sugerir-escala
description: Monta uma sugestão de escala de folgas para o mês seguinte, a partir da equipe ativa e da configuração salva por /gerente-configurar-escala, e manda para aprovação do gerente.
allowed-tools: Read, Write, Edit, Bash
model: sonnet
---

# Sugerir escala

Monta uma proposta de escala de folgas pro mês seguinte e manda pro canal configurado, pra o gerente aprovar. Não aplica nada sozinho sem aprovação — só sugere.

## Passo 0. Dados necessários

Leia `dna/indicadores/config-escala.md`. Se não existir (ou estiver com os placeholders do template, sem nada preenchido de verdade): pare e informe que é preciso rodar `/gerente-configurar-escala` primeiro. Não invente horário de funcionamento, tipo de escala ou regras trabalhistas.

Leia `dna/indicadores/vendedores.json` e extraia os vendedores com `ativo=true` (mesma lógica de "quem está na loja" usada no resto do sistema). Sem nenhum vendedor ativo: pare e explique que não há equipe cadastrada ainda pra montar uma escala.

Leia `dna/indicadores/escala-{mês corrente, AAAA-MM}.csv`, se existir, só pra saber que dia da semana cada vendedor vinha folgando mais recentemente (usado como preferência leve pro mês novo — evita trocar o dia de alguém sem necessidade — nunca como regra rígida, já que a escala agora é uma grade por data, não um padrão semanal fixo).

**Padrão do mesmo mês, ano anterior (sazonalidade — só entra em jogo com 1 ano+ de histórico).** Verifique se existe `dna/indicadores/escala-{mês alvo, mas do ano anterior}.csv` (ex: sugerindo setembro/2027, procure `escala-2026-09.csv`). **Se não existir, ignore este passo inteiro** — a sugestão segue só com a continuidade do mês anterior, exatamente como já funciona hoje. Se existir: pra cada domingo do mês alvo, conte quantos vendedores ficaram de folga (célula não vazia) no domingo de mesma posição daquele mês no ano anterior (1º domingo com 1º domingo, 2º com 2º, etc.) — guarde essa contagem como referência de cobertura pro Passo 2.

## Passo 1. Definir o mês alvo

Por padrão, a sugestão é sempre pro **mês seguinte** ao mês corrente (é assim que dá tempo do gerente aprovar antes do mês começar). Se for chamado com uma instrução explícita de outro mês, use o mês pedido.

## Passo 2. Montar a distribuição

A saída é uma grade completa do mês alvo: pra cada vendedor ativo, quais **datas específicas** ele folga (não mais um único dia da semana fixo pro mês inteiro).

1. Dias da semana permitidos pra folga = os 7 dias da semana, **menos** os dias listados em "Dias que nunca podem ter folga" de `config-escala.md` que forem dias da semana recorrentes (ex: "sábado"). Se a lista tiver datas específicas (ex: "24/12") em vez de dias da semana, bloqueie só aquela data pontual, pra qualquer vendedor — anote como observação separada no final.
2. Se não sobrar nenhum dia da semana permitido, pare e avise que a configuração atual não deixa nenhum dia viável pra folga — peça pra revisar `/gerente-configurar-escala`.
3. Divida o mês alvo em semanas (semana = segunda a domingo, a primeira e a última podem ser parciais se o mês não começar numa segunda). Pra cada semana, na ordem, e pra cada vendedor ativo (ordem alfabética, pra ser determinístico):
   - Se o dia da semana mais recente de folga desse vendedor (Passo 0) ainda está entre os permitidos, prefira uma data dessa mesma semana caindo nesse dia da semana (continuidade > otimização).
   - Senão, escolha, dentro dos dias permitidos **daquela semana específica**, a data com **menos vendedores já alocados nela até aqui** (equilíbrio de cobertura — evita todo mundo folgando no mesmo dia).
   - Cada vendedor ativo recebe exatamente uma data de folga por semana do mês (semana parcial no início/fim do mês também conta, mesmo que mais curta).
4. Ao final, se algum dia da semana ficou com muito mais gente alocada no mês inteiro que os outros (diferença de 2+ vendedores em relação ao dia menos carregado) sem necessidade de manter continuidade de ninguém, redistribua as ocorrências mais recentes desse dia pro dia menos carregado.
5. **Domingos, quando houver referência do ano anterior (Passo 0):** ao decidir quantos vendedores ficam de folga num domingo específico deste mês, prefira manter uma contagem parecida à do domingo de mesma posição no ano anterior (mesmo nível de cobertura, não precisa ser a mesma pessoa — ajuste proporcionalmente se a equipe ativa mudou de tamanho). É um critério a mais dentro da escolha de equilíbrio do passo 3, nunca sobrepõe os dias bloqueados de `config-escala.md`.

## Passo 3. Montar a mensagem

Resuma por vendedor — se as datas caíram sempre no mesmo dia da semana, diga isso (mais fácil de guardar); se variou, liste as datas soltas:

```
📋 Sugestão de escala — {mês alvo}/{ano}

{para cada vendedor, uma linha}: {vendedor} → folga dias {lista de datas, ex: "4, 11, 18, 25"} {"(sempre " + dia da semana + ")" se todas as datas caíram no mesmo dia da semana}

Base usada: {resumo de 1 frase da regra trabalhista de config-escala.md — ex: "convenção coletiva do comércio de {cidade}, folga semanal remunerada garantida"}
{se houver datas específicas bloqueadas}: ⚠️ Sem folga em: {lista de datas}
{se usou o padrão do ano anterior (Passo 0)}: 📅 Domingos ajustados pra manter cobertura parecida ao mesmo período do ano passado.

Essa é uma sugestão — confirma se pode aplicar, ou me diga o que ajustar (ex: trocar a data de alguém específico).
```

## Passo 3.5. Gerar a imagem da escala

A sugestão vai ilustrada, com a identidade visual da própria loja (nunca a identidade da Vetria) — texto puro só entra como legenda curta ou como reserva se a imagem não puder ser gerada. Isso vale tanto no fluxo interativo quanto no automático.

**a. Levantar a identidade visual da loja.** Leia `dna/workbook-dna.docx`, seção "Identidade Visual" (cores institucionais, tipografia, descrição do logo). Faça também um `Glob` em `dna/identidade-visual/**/*.{png,jpg,jpeg,svg}` e `dna/**/*logo*.{png,jpg,jpeg,svg}` — se achar um arquivo que pareça ser o logo da loja, use-o de verdade na imagem (`<img>`, caminho relativo — ver regra de caminho relativo no Passo c). Sem logo encontrado, não invente um: use o nome da loja como wordmark, tipografado com capricho, no lugar do logo.

Sem nenhuma cor institucional definida no Workbook (seção ainda vazia): não use a paleta da Vetria (navy/dourado são da marca Vetria, não da loja). Escolha uma paleta neutra e sóbria (tons de grafite, areia ou creme com um único acento discreto) coerente com o segmento da loja, e prossiga — nunca pare a entrega por falta disso.

**b. Montar a grade visual.** HTML de página única, fundo levemente texturizado ou sólido na cor de base da marca, com:
- **Topo:** logo ou wordmark da loja + "Sugestão de Escala" + "{mês alvo por extenso} de {ano}".
- **Corpo, uma linha por vendedor ativo** (mesma ordem alfabética do Passo 2): nome do vendedor à esquerda; à direita, uma tira horizontal com um círculo pra cada dia do mês (numerado), os dias de folga desse vendedor preenchidos na cor de acento da marca, os demais em contorno neutro. Uma linha fina de iniciais do dia da semana (D S T Q Q S S) acima da primeira tira, alinhada às colunas, pra dar contexto sem repetir em cada linha.
- **Rodapé:** a linha "Base usada: {resumo da regra trabalhista}" do Passo 3, e as observações condicionais (bloqueios, ajuste sazonal) quando existirem, numa caixa discreta.
- **Fechamento:** "Essa é uma sugestão. Responda pra confirmar ou pedir ajuste." em destaque sutil.
- Formato vertical (largura 1080, altura conforme o conteúdo, igual à Prancha Completa) — pensado pra abrir bem numa tela de celular.

**c. Renderizar.** Mesmo mecanismo da Prancha Completa (`.claude/skills/gerar-imagem/SKILL.md`, Passo 2c/2d) — leia `VETRIA_EXE_PATH` do `.env` manualmente (nunca confie em `process.env`), gere o HTML e qualquer imagem de apoio (logo) na mesma pasta temporária, e rode:

```js
execFileSync(exePath, ['--render-html-para-png', entradaHtml, saidaPng, '--width', '1080'], { stdio: 'pipe' });
```

Salve o resultado em `entregas/gestao/apresentacoes/escala-{mês alvo, AAAA-MM}.png` — a pasta `apresentacoes/` (não `imagens/`) é o que faz o app abrir isso em tela cheia com opção de baixar, em vez do balão pequeno (ver Passo 2d de `gerar-imagem/SKILL.md`).

**Sem `VETRIA_EXE_PATH` (ausente ou arquivo não existe):** não existe alternativa de renderização — siga só com a mensagem de texto do Passo 3, e avise que atualizar a Vetria habilita a versão ilustrada.

## Passo 4. Registrar e enviar

Registre em `entregas/registro-atividades.md` uma entrada com título "Sugestão de escala — {mês alvo}/{ano}" e status **pendente validação** (mesmo padrão usado pros outros entregáveis do sistema).

**Se estiver rodando de forma interativa** (tem um usuário respondendo no momento): mostre a imagem do Passo 3.5 aqui no chat primeiro (referencie o caminho `entregas/gestao/apresentacoes/escala-{AAAA-MM}.png` puro na resposta — abre em tela cheia automaticamente), com a mensagem do Passo 3 como legenda abaixo. Sem imagem gerada, mostre só o texto do Passo 3. Se o usuário confirmar que pode aplicar, escreva o resultado em `dna/indicadores/escala-{mês alvo, AAAA-MM}.csv` — a grade completa (header `vendedor` + uma coluna por dia do mês, célula `F` nas datas de folga, vazio nos outros dias, um arquivo novo ou substituindo o conteúdo anterior desse mês) — e atualize a entrada em `registro-atividades.md` pra **validado**. Se pedir ajustes, refaça a distribuição considerando o pedido, regenere a imagem (Passo 3.5) e mostre de novo antes de aplicar.

**Se estiver rodando de forma automática e agendada** (sem usuário disponível pra responder — ex: acionado no fim do mês pelo backend): não aplique nada em `escala-{mês alvo}.csv` sozinho. Envie a imagem do Passo 3.5 pro canal configurado (mesma lógica de destino usada em `/gerente-enviar-relatorio` — `TELEGRAM_CHAT_ID_GERENTE` se configurado, senão o grupo), com a mensagem do Passo 3 como legenda:

**Se `TELEGRAM`** (imagem gerada): leia `TELEGRAM_BOT_TOKEN` do `.env`. Salve a legenda num arquivo temporário, igual ao padrão de `/gerente-enviar-relatorio`:
```bash
TMPFILE=$(mktemp)
cat > "$TMPFILE" <<'EOF'
{LEGENDA — mensagem do Passo 3}
EOF
curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto" \
  -F "chat_id=${TELEGRAM_CHAT_ID_GERENTE}" \
  -F "caption=<${TMPFILE}" \
  -F "photo=@${CAMINHO_PNG}"
rm "$TMPFILE"
```

**Se `WHATSAPP`** (imagem gerada): a Z-API espera a imagem como base64/data URI dentro do JSON, então use um script Node curto (mesmo espírito do `gerar-imagem/SKILL.md`) pra ler o PNG, montar o payload e enviar — nunca escreva token/client-token literal no comando, leia do `.env` dentro do próprio script:
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
' "${CAMINHO_PNG}" "{LEGENDA — mensagem do Passo 3}"
```

**Sem imagem gerada** (Passo 3.5 caiu no fallback): use exatamente o envio em texto puro já documentado (`sendMessage`/`send-text`), igual ao padrão de `/gerente-enviar-relatorio`.

Confira o retorno da chamada (mesmos diagnósticos de `/gerente-enviar-relatorio`, Passo 7). Em sucesso, informe "Sugestão de escala enviada." Em qualquer erro, mostre o retorno bruto para diagnóstico em vez de assumir que funcionou.

A aplicação de fato em `escala-{mês alvo}.csv` só acontece numa sessão futura, quando alguém confirmar.

## Passo 5. Sem canal configurado

Se `GERENTE_CANAL_RELATORIO` não estiver definido no `.env`, ainda assim monte e mostre a sugestão (Passo 3) — só não tenta enviar por nenhum canal, e avise que configurar um canal (`/configurar-canal-relatorio`) permite receber isso automaticamente todo mês.
