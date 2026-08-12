---
name: gerar-imagem
description: >
  Gera uma imagem diretamente, sem sair do Claude Code, a partir de um prompt pronto.
  Usada pelo Vetria Stylist (pranchas, looks, fotos humanizadas), pelo Vetria Marketing
  (conteúdo visual pra post/story quando fizer sentido) e pelo Gerente IA (cards de
  indicador/ranking, banners de corrida ou prêmio). Se a geração não estiver
  configurada ou falhar, sempre entregue o prompt pronto como alternativa, para o
  usuário usar em outra plataforma (Midjourney, ChatGPT, etc.) se preferir.
---

# Gerar Imagem

Skill compartilhada para agents que precisam produzir uma imagem de verdade (não só o prompt) sem sair do Claude Code. Usa a API da OpenRouter, que dá acesso a modelos de geração de imagem (ex: Gemini "nano-banana") por uma chave só.

## Quando usar

Sempre que um agent for entregar um "prompt de imagem" (looks, pranchas, fotos humanizadas, criativos) **e a geração estiver configurada** (ver Passo 1), gere a imagem de verdade direto, sem perguntar antes — nunca pause pra confirmar "quer que eu gere?". A pessoa já decidiu isso ao configurar a chave; perguntar de novo a cada pedido só atrasa. Informe o custo só se ela perguntar, não de forma preventiva toda hora.

**Sempre entregue o prompt de qualquer forma**, mesmo gerando a imagem — é o plano B pronto se o resultado não agradar ou se quiser tentar em outro lugar.

**Recapitulando uma prancha/peça antiga que só tem o prompt (sem imagem gerada)** — se o usuário pedir pra ver de novo algo já entregue antes (ex: "aquela prancha do mule dourado") e esse entregável não tiver uma imagem gerada, gere agora direto (mesma regra acima), mesmo que a pessoa não tenha pedido isso explicitamente — é bem provável que na época não estivesse configurado ainda.

## Passo 1. Verificar se está configurado

**Releia o `.env` na hora, sempre — mesmo que já tenha verificado antes na mesma conversa.** A configuração pode ter mudado no meio da conversa (é justamente o caso mais comum: o usuário configura a chave enquanto já está no meio de um assunto e continua de onde parou). Nunca responda "não está configurado" baseado em uma verificação anterior — isso pode já ter mudado.

Leia `.env`. Verifique `OPENROUTER_API_KEY`.

- **Ausente:** informe que a geração de imagem ainda não está configurada, entregue só o prompt, e oriente a rodar `/configurar-geracao-imagem` se quiser habilitar. Não trate isso como erro — é uma opção, não obrigação.
- **Presente:** siga para o Passo 2.

## Passo 2. Gerar

Nunca carregue o base64 da imagem no contexto da conversa (é enorme e desperdiça espaço) — a chamada e a decodificação acontecem inteiramente via script, você só lê o resultado final (caminho do arquivo + sucesso/erro).

**Releia este arquivo agora, não confie em ter rodado esse script antes na mesma conversa.** Já aconteceu de um agent reusar de memória um nome de modelo antigo (de uma execução anterior, na mesma conversa) em vez do que está escrito aqui embaixo — e esse arquivo pode ter sido atualizado desde a última vez que você o leu, principalmente o nome do modelo, que muda de tempos em tempos conforme a OpenRouter descontinua versões.

Prompt final já revisado (traduzido pro inglês costuma dar resultado mais consistente, mantendo todos os detalhes). Rode via Node (evita depender de `jq`, que não está disponível em todo ambiente):

```bash
DEST="minhas-empresas/{ativa}/entregas/{gestao, styling ou marketing}/imagens/{nome-descritivo}.png"
mkdir -p "$(dirname "$DEST")"
node -e '
const https = require("https");
const fs = require("fs");
const path = require("path");

const prompt = process.argv[1];
const dest = process.argv[2];
const apiKey = process.env.OPENROUTER_API_KEY;

const body = JSON.stringify({
  model: "google/gemini-3.1-flash-lite-image",
  messages: [{ role: "user", content: prompt }],
  modalities: ["image", "text"],
});

const req = https.request(
  "https://openrouter.ai/api/v1/chat/completions",
  { method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" } },
  (res) => {
    let data = "";
    res.on("data", (c) => (data += c));
    res.on("end", () => {
      if (res.statusCode !== 200) {
        console.error(`HTTP ${res.statusCode}: ${data.slice(0, 500)}`);
        process.exit(1);
      }
      const json = JSON.parse(data);
      const msg = json.choices && json.choices[0] && json.choices[0].message;
      const imgField =
        (msg && msg.images && msg.images[0] && msg.images[0].image_url && msg.images[0].image_url.url) ||
        (typeof msg?.content === "string" && msg.content.startsWith("data:image") ? msg.content : null);
      if (!imgField) {
        console.error("Nenhuma imagem encontrada na resposta. JSON bruto (primeiros 800 chars): " + data.slice(0, 800));
        process.exit(1);
      }
      const base64 = imgField.split(",").pop();
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, Buffer.from(base64, "base64"));
      console.log("OK " + dest);
    });
  }
);
req.on("error", (e) => { console.error(e.message); process.exit(1); });
req.write(body);
req.end();
' "PROMPT_AQUI" "$DEST"
```

Substitua `PROMPT_AQUI` pelo prompt real e `{ativa}`/`{gestao, styling ou marketing}`/`{nome-descritivo}` antes de rodar. Se a estrutura da resposta não bater com o esperado (a API pode mudar), o script imprime o JSON bruto (truncado) pro erro — ajuste o caminho de extração do campo de imagem e tente de novo. Nunca deixe de entregar por causa disso: mostre o prompt como alternativa nesse caso.

## Passo 3. Entregar

Se o script imprimir `OK {caminho}`, informe o caminho ao usuário. Nunca mostre base64 no chat.

## Passo 4. Erros comuns

- `401`/`invalid api key`: chave inválida, oriente a rodar `/configurar-geracao-imagem` de novo.
- `402`/créditos insuficientes: conta OpenRouter sem crédito, informe e ofereça o prompt como alternativa.
- Timeout ou erro de rede: tente uma vez mais; se persistir, entregue o prompt como alternativa em vez de travar a conversa nisso.

Em qualquer falha, o prompt pronto (que você já tinha) sempre resolve — a geração direta é conveniência, não dependência.
