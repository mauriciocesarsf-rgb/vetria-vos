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

Skill compartilhada para agents que precisam produzir uma imagem de verdade (não só o prompt) sem sair do Claude Code. Usa a API da OpenRouter, que dá acesso a modelos de geração de imagem por uma chave só — hoje o modelo é `google/gemini-3-pro-image-preview` (Nano Banana Pro, da Google — trocado em 2026-08-18: testado lado a lado com o `gpt-image-1` anterior num caso real de textura fina/repetida — tachas metálicas numa bota — e saiu bem mais fiel, preservando o formato/acabamento do hardware em vez de reinterpretar como pérola lisa; ver `agents-memory/vetria-stylist.md` pro teste completo), via o endpoint dedicado de imagens da OpenRouter (`/api/v1/images`, formato de request diferente do chat completions — ver Passo 2; o mesmo formato com `input_references` funciona pra ambos os modelos, confirmado).

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

**REGRA CRÍTICA — produto real sempre precisa de imagem de referência.** Se a imagem é de um produto que o cliente enviou (foto de produto pra montar prancha, look, etc.), **nunca gere só a partir de texto** — isso desenha um produto novo do zero, do jeito que o modelo "imagina" pela descrição, o que quase nunca bate com o produto de verdade (cor, formato, detalhes ficam diferentes). Isso viola a regra do Vetria Stylist de nunca alterar as características do produto real. Sempre que houver uma foto real do produto disponível (o caminho vem informado na mensagem do usuário quando ele anexa uma imagem no chat, algo como `dna/produtos-recebidos/produto-....png`, ou pode estar em `dna/` como material da empresa), **use essa foto como imagem de referência na chamada** (Passo 2b) — o modelo edita/recompõe em cima da foto real (troca fundo, adiciona composição, still de vitrine) em vez de recriar o produto do zero.

Se não houver nenhuma foto real do produto disponível (pedido é só conceitual, sem produto específico, ou a foto se perdeu), pode gerar só com texto — mas nesse caso o resultado é necessariamente genérico/ilustrativo, nunca apresente como sendo "o produto da loja". Deixe isso claro pro usuário nesse caso.

**Mesmo com a foto real como referência, quanto maior a transformação pedida, maior o risco do produto sair diferente do real** (testado, 2026-08-14 — ver "Risco de fidelidade por tipo de prancha" no seu agent, `vetria-stylist.md`). Ao escrever o prompt de edição: descreva o produto pelos detalhes específicos que não podem mudar (cor exata, padrão, formato, textura — nunca só "preserve o produto"), descreva apenas o que muda (cena/pose/iluminação), e prefira enquadramentos próximos ao da foto original quando a fidelidade for crítica — recomposição completa (corpo inteiro, cena nova) tem risco real mesmo com a referência.

**Antes de escrever o prompt, confira se alguma parte do produto está OCULTA na foto de referência** (coberta por mão, acessório, dobra de tecido, ângulo, fora de foco/corte) — achado real, 2026-08-17: numa bolsa seguindo mão/lenço cobrindo boa parte da frente, ao pedir uma composição "limpa" mostrando a bolsa inteira, o modelo inventou um tipo de fechamento (fivela) que não estava confirmado na foto real. **Detalhe oculto na referência não pode ser descrito no prompt como se fosse confirmado** — isso é o mesmo tipo de fabricação que inventar um logo. Duas saídas: (a) mantenha na imagem final a mesma área oculta/coberta que já estava na foto original (não peça pro modelo "revelar" o que não dá pra ver), ou (b) se o formato exige mostrar aquela área, não descreva nenhum mecanismo de fechamento/ferragem específico pra ela no prompt — deixe implícito/neutro (ex: "front panel, seam construction not specified") em vez de nomear uma peça de hardware que você não confirmou.

Nunca carregue o base64 da imagem no contexto da conversa (é enorme e desperdiça espaço) — a chamada e a decodificação acontecem inteiramente via script, você só lê o resultado final (caminho do arquivo + sucesso/erro).

**Nunca escreva o valor da `OPENROUTER_API_KEY` literal dentro do comando Bash** (nem em `export CHAVE="valor"`, nem em nenhum outro lugar do comando) — isso expõe a chave em texto puro no log da execução. Incidente real (2026-08-19): um comando montado dessa forma vazou a chave real no log. Sempre carregue via `set -a && source .env && set +a` (como nos exemplos abaixo) e deixe o script Node ler `process.env.OPENROUTER_API_KEY` sozinho — a chave nunca deve aparecer como texto literal em nenhum comando que você escreve.

**Releia este arquivo agora, não confie em ter rodado esse script antes na mesma conversa.** Já aconteceu de um agent reusar de memória um nome de modelo antigo (de uma execução anterior, na mesma conversa) em vez do que está escrito aqui embaixo — e esse arquivo pode ter sido atualizado desde a última vez que você o leu, principalmente o nome do modelo, que muda de tempos em tempos conforme a OpenRouter descontinua versões.

Prompt final já revisado (traduzido pro inglês costuma dar resultado mais consistente, mantendo todos os detalhes — e para edição, descreva o que MUDA, tipo "put this exact product on a plain white studio background, professional product photography lighting", nunca redescreva o produto em si). Rode via Node (evita depender de `jq`, que não está disponível em todo ambiente):

### 2a. Sem imagem de referência (só texto — só quando não existir foto real do produto)

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
  model: "google/gemini-3-pro-image-preview",
  prompt: prompt,
  n: 1,
  quality: "high",
  output_format: "png",
});

const req = https.request(
  "https://openrouter.ai/api/v1/images",
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
      const b64 = json.data && json.data[0] && json.data[0].b64_json;
      if (!b64) {
        console.error("Nenhuma imagem encontrada na resposta. JSON bruto (primeiros 800 chars): " + data.slice(0, 800));
        process.exit(1);
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, Buffer.from(b64, "base64"));
      console.log("OK " + dest);
    });
  }
);
req.on("error", (e) => { console.error(e.message); process.exit(1); });
req.write(body);
req.end();
' "PROMPT_AQUI" "$DEST"
```

### 2b. Com imagem de referência (produto real — usar sempre que houver foto disponível)

Mesma lógica, mas manda a foto real em `input_references` (base64, até 16 imagens — aqui sempre 1) — isso faz o modelo editar/recompor em cima da imagem real em vez de desenhar do zero:

```bash
DEST="minhas-empresas/{ativa}/entregas/{gestao, styling ou marketing}/imagens/{nome-descritivo}.png"
REF="minhas-empresas/{ativa}/{caminho-da-foto-real-do-produto}"
mkdir -p "$(dirname "$DEST")"
node -e '
const https = require("https");
const fs = require("fs");
const path = require("path");

const prompt = process.argv[1];
const dest = process.argv[2];
const refPath = process.argv[3];
const apiKey = process.env.OPENROUTER_API_KEY;

const refExt = path.extname(refPath).slice(1).toLowerCase();
const refMime = refExt === "jpg" ? "jpeg" : refExt;
const refB64 = fs.readFileSync(refPath).toString("base64");

const body = JSON.stringify({
  model: "google/gemini-3-pro-image-preview",
  prompt: prompt,
  quality: "high",
  input_references: [
    { type: "image_url", image_url: { url: `data:image/${refMime};base64,${refB64}` } },
  ],
});

const req = https.request(
  "https://openrouter.ai/api/v1/images",
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
      const b64 = json.data && json.data[0] && json.data[0].b64_json;
      if (!b64) {
        console.error("Nenhuma imagem encontrada na resposta. JSON bruto (primeiros 800 chars): " + data.slice(0, 800));
        process.exit(1);
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, Buffer.from(b64, "base64"));
      console.log("OK " + dest);
    });
  }
);
req.on("error", (e) => { console.error(e.message); process.exit(1); });
req.write(body);
req.end();
' "PROMPT_AQUI" "$DEST" "$REF"
```

Substitua `PROMPT_AQUI` pelo prompt real e `{ativa}`/`{gestao, styling ou marketing}`/`{nome-descritivo}`/`{caminho-da-foto-real-do-produto}` antes de rodar. Se a estrutura da resposta não bater com o esperado (a API pode mudar), o script imprime o JSON bruto (truncado) pro erro — ajuste o caminho de extração do campo de imagem e tente de novo. Nunca deixe de entregar por causa disso: mostre o prompt como alternativa nesse caso.

### 2c. Prancha Completa (Vetria Stylist) — renderizar HTML e remover fundo, via Vetria.exe

**Só se aplica ao formato "Prancha Completa" do Vetria Stylist** (infográfico com título, paleta, looks, etc. — ver `vetria-stylist.md`). Os outros formatos de prancha usam só o Passo 2a/2b acima, normalmente.

Texto denso (parágrafos, bullets, paleta de cores) sai embaralhado quando o modelo de imagem tenta "desenhar" as letras — por isso a Prancha Completa é composta em **HTML real** (texto sempre nítido) e depois renderizada pra PNG. Fotos que precisam ficar sem fundo (produto, looks) passam por remoção de fundo via chroma-key. As duas operações rodam **fora da API da OpenRouter** — usam o próprio `Vetria.exe` já instalado na máquina do cliente, chamado como subprocesso (o app Electron já embute o Chromium pra renderizar HTML, e usa a lib `sharp` pra remoção de fundo — nenhuma das duas depende de Python nem de Chrome do sistema).

**Como achar o executável:** leia e parseie o `.env` manualmente (não confie em `process.env` estar populado — não há garantia disso no ambiente do Bash tool):

```js
function lerEnv(chave) {
  const conteudo = fs.readFileSync('.env', 'utf8')
  const m = new RegExp(`^${chave}=(.*)$`, 'm').exec(conteudo)
  return m ? m[1].trim() : null
}
const exePath = lerEnv('VETRIA_EXE_PATH')
```

- **Ausente ou arquivo não existe** (`!exePath || !fs.existsSync(exePath)`): instalação antiga, sem essa feature. **Não existe fallback pra Python/Chrome** (isso nunca esteve garantido na máquina do cliente, era só método de teste manual). Avise que precisa atualizar o Vetria pra habilitar a Prancha Completa, e ofereça os outros 5 tipos de prancha (que não dependem disso) como alternativa imediata.

**Os dois modos, chamados via `execFileSync`:**

```js
const { execFileSync } = require('child_process');

// Renderiza HTML -> PNG (produto do body.scrollHeight, largura fixa 1080 por padrão)
execFileSync(exePath, ['--render-html-para-png', entradaHtml, saidaPng, '--width', '1080'], { stdio: 'pipe' });

// Remove fundo por chroma-key (amostra a cor dos 4 cantos, transição suave por distância de cor)
execFileSync(exePath, ['--recorte-chroma-key', entradaPng, saidaPng, '--low', '12', '--high', '55'], { stdio: 'pipe' });
```

Ambos os modos: saída de sucesso é `OK {caminho absoluto do arquivo gerado}` no stdout, código de saída `0`. Erro: mensagem no stderr, código de saída `1` — `execFileSync` lança exceção nesse caso (capturar com try/catch, ler `err.stderr.toString()` pra diagnosticar).

`--render-html-para-png` aceita HTML com caminhos de imagem relativos (`<img src="produto.png">`) resolvidos relativos à pasta do próprio arquivo HTML — gere o HTML e as imagens de apoio na mesma pasta.

## Passo 3. Entregar

Se o script imprimir `OK {caminho}`, informe o caminho ao usuário. Nunca mostre base64 no chat.

**Se a imagem foi gerada a partir de uma foto real de produto (Passo 2b), ela é sempre um rascunho até o usuário confirmar.** Já aconteceu de sair diferente do produto real mesmo usando a foto como referência — o mecanismo reduz o risco, não elimina. Nunca apresente esse tipo de imagem como "pronta"/"entrega concluída" — deixe explícito que é rascunho e peça pra comparar com o produto real antes de usar em qualquer lugar (venda, rede social, etc.):

```
Gerei a imagem usando a foto real como referência: {caminho}

⚠️ Antes de usar: compara com a foto original e confirma que bateu — cor, formato e detalhes do produto real. Só considere pronta depois de checar; me avisa se precisar ajustar ou gerar de novo.
```

**Antes de entregar, você mesmo já compare a imagem gerada com a foto de referência** (Read nos dois arquivos), item por item: silhueta/formato geral, tipo e posição de qualquer fechamento/ferragem, cor exata, marcas/etiquetas/detalhes distintivos, alças/pontos de fixação. Não é uma olhada geral — confira cada item da lista.

**Limite de 1 nova tentativa automática (controle de custo — 2026-08-17).** Se a checagem acima falhar, pode gerar de novo **uma única vez**, com o prompt ajustado pro problema específico encontrado (não peça mais uma tentativa igual). Se ainda assim não bater depois dessa 2ª tentativa, **pare — não gere uma 3ª vez sozinho.** Entregue a melhor versão que tiver, com um aviso específico (não genérico) sobre exatamente qual detalhe ficou incerto/diferente, mais o prompt pronto como alternativa, e pergunte se o usuário quer tentar de novo ou seguir assim. Cada tentativa tem custo real — em escala (vários clientes pedindo imagem), gerar sem parar até "acertar" fica caro rápido; é melhor entregar rápido com um aviso claro do que ficar tentando sozinho.

Isso não se aplica a imagens sem produto real de referência (cards, banners, conteúdo genérico/conceitual do Passo 2a) — essas seguem normal, sem essa ressalva.

## Passo 4. Erros comuns

- `401`/`invalid api key`: chave inválida, oriente a rodar `/configurar-geracao-imagem` de novo.
- `402`/créditos insuficientes: conta OpenRouter sem crédito, informe e ofereça o prompt como alternativa.
- Timeout ou erro de rede: tente uma vez mais; se persistir, entregue o prompt como alternativa em vez de travar a conversa nisso.

Em qualquer falha, o prompt pronto (que você já tinha) sempre resolve — a geração direta é conveniência, não dependência.
