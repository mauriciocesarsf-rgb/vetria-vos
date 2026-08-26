---
name: vetria:gerente-boas-vindas-mes
description: Monta uma análise individual por vendedor (meta pessoal, corridas vigentes, ponto de melhoria do mês anterior e sugestão prática) e envia uma mensagem separada por vendedor para o canal do gerente, pronta para ele encaminhar a cada um.
allowed-tools: Read, Bash
model: sonnet
---

# Gerente IA. Boas-vindas do Mês

Executa imediatamente: monta uma mensagem individual por vendedor e envia todas para o **destino pessoal do gerente** (diferente do destino de grupo usado por `/gerente-enviar-relatorio`) — uma mensagem por vez, cada uma pronta para o gerente copiar e encaminhar ao vendedor certo. Não envia direto para o vendedor nem para o grupo; o gerente é sempre quem entrega o feedback ao time. Sem agendamento — para rodar sozinho todo início de mês, agende este comando com a skill `schedule`.

## Passo 1. Verificar canal configurado

Leia `.env`. Verifique `GERENTE_CANAL_RELATORIO`.

- **Vazio ou ausente:** acione a skill `configurar-canal-relatorio`. Quando terminar, retorne aqui.
- **`TELEGRAM`:** verifique `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID_GERENTE`. Se faltar, acione a skill `configurar-telegram` (ela configura o destino do gerente separadamente do destino de grupo), depois retorne.
- **`WHATSAPP`:** verifique `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN`, `GERENTE_WHATSAPP_DESTINO_GERENTE`. Se faltar, acione a skill `configurar-whatsapp`, depois retorne.

## Passo 2. Ler meta do mês, corridas e desempenho do mês anterior

Leia `minhas-empresas/.ativa`. Leia `minhas-empresas/{ativa}/dna/indicadores/meta-mensal-loja.csv`, `corridas.csv`, `premios-especiais.csv`, `vendas.csv` e `vendedores.json`.

Determine o mês de referência (o mês corrente, ou o que o usuário indicar). Encontre a linha de `meta-mensal-loja.csv` desse mês. Se não existir, informe que a meta do mês ainda não foi cadastrada e oriente a preencher antes de rodar este comando. Encerre.

Filtre `corridas.csv` e `premios-especiais.csv` para as linhas vigentes no mês (período cobre alguma parte do mês).

Identifique os vendedores ativos: leia `vendedores.json` e filtre `ativo=true` (ao casar com `vendas.csv`, confira também `nomesAnteriores`). Se o arquivo não existir ou estiver vazio (equipe toda nova, ninguém cadastrado ainda), pergunte ao usuário os nomes dos vendedores ativos antes de prosseguir — nunca invente.

**Meta individual do mês:** `meta_loja` do mês ÷ número de vendedores ativos (mesma lógica de `/gerente-enviar-relatorio`).

**Desempenho do mês anterior, por vendedor:** some `valor`, `tickets`, `pecas_liquidas`, `clientes_atendidos` das linhas desse vendedor no mês anterior. Calcule PA, TM, PM. Compare com a média do time no mesmo período para identificar:
- Um ponto forte (indicador acima da média do time).
- Um ponto de melhoria (indicador mais abaixo da média do time, ou mais distante da meta anterior).

Se não houver dados do mês anterior para um vendedor específico (ex: entrou agora), omita a seção "mês anterior" só na mensagem dele — nunca invente histórico.

## Passo 3. Montar uma mensagem por vendedor

Para cada vendedor, monte (adapte o tom ao "Tom de comunicação" do Workbook DNA):

```
📋 Encaminhar para: {vendedor}
—

👋 Bom mês, {vendedor}!

🎯 Sua meta de {mês}: R$ {meta individual}

🏁 Corridas e premiações deste mês:
{para cada corrida/prêmio especial vigente que o afeta, uma linha curta: nome + o que precisa fazer + prêmio}
{se não houver nenhuma: omita esta seção}

📊 Olhando o mês passado:
✅ Seu ponto forte: {ponto forte, com o número}
🔧 Onde focar: {ponto de melhoria, com o número, sem tom de cobrança}

💡 Sugestão prática: {1 sugestão concreta e acionável ligada ao ponto de melhoria — ex: se PM baixo, reforçar oferta de complementos; se conversão baixa, sugerir abordagem mais rápida; nunca genérica tipo "se esforce mais"}

🔥 {frase motivacional curta, variando entre vendedores para não parecer copiado e colado — se `sonhos` e/ou `objetivos` estiverem preenchidos pra esse vendedor em `vendedores.json`, use-os pra tornar a frase concreta e pessoal (ex: citar o sonho ou um dos objetivos) em vez de genérica; sem esses campos preenchidos, mantenha a regra atual (nunca genérica tipo "se esforce mais")}
```

A primeira linha ("📋 Encaminhar para: {vendedor}") existe só para o gerente saber pra quem repassar — não faz parte do texto que ele efetivamente encaminha; deixe claro isso na prévia do Passo 4.

Regras: nunca inclua julgamento negativo. "Onde focar" descreve o indicador, não a pessoa ("PA do mês passado ficou em 1,1, abaixo da média do time" — não "você vendeu pouco"). A sugestão prática é específica ao indicador identificado, nunca genérica.

## Passo 3.5. Gerar a versão ilustrada (uma por vendedor)

Conteúdo de início de mês sempre vai ilustrado, com a identidade visual da própria loja, seguindo o Passo 2d de `.claude/skills/gerar-imagem/SKILL.md`. Gere uma imagem por vendedor (mesmo conteúdo da mensagem individual dele no Passo 3), salvando cada uma em `entregas/gestao/apresentacoes/boas-vindas-mes-{vendedor-slug}-{AAAA-MM}.png`.

Sem `VETRIA_EXE_PATH` disponível: siga sem imagem, só com o texto do Passo 3 normalmente — sem bloquear a entrega.

## Passo 4. Confirmar envio

Mostre as {N} mensagens (prévia completa ou resumida se forem muitas) e pergunte:

```
Preparei {N} mensagens individuais para o início do mês — uma por vendedor, todas indo para o seu canal ({destino}), prontas pra você encaminhar pra cada um.

Enviar as {N} agora?

1. Sim, enviar todas
2. Enviar só algumas (escolher quais)
3. Não, só mostrar aqui
```

Se opção 3: encerre sem chamar nenhuma API. Se opção 2: pergunte quais.

## Passo 5. Enviar

Para cada vendedor confirmado, envie a mensagem dele (com a imagem do Passo 3.5 correspondente, quando existir, como legenda igual ao padrão de imagem) como uma chamada separada à API, para o **destino do gerente** — não o destino de grupo:

**Se `TELEGRAM`:** use `TELEGRAM_CHAT_ID_GERENTE` (em vez de `TELEGRAM_CHAT_ID_GRUPO`) no mesmo formato de `curl` de `/gerente-enviar-relatorio` Passo 6 (variante com imagem ou sem, conforme o Passo 3.5 tenha gerado ou não).

**Se `WHATSAPP`:** use `GERENTE_WHATSAPP_DESTINO_GERENTE` (em vez de `GERENTE_WHATSAPP_DESTINO_GRUPO`) no mesmo formato de lá — o `phone`/destino do payload é sempre esse número, sempre um contato individual, nunca um grupo.

Mesmas regras de segurança: arquivo temporário para o corpo da requisição, nunca credenciais como argumento de linha de comando, nunca imprimir Token/Client-Token/Bot Token no chat. São {N} chamadas separadas, uma por vendedor — nunca uma mensagem só concatenada.

## Passo 6. Resultado

Reporte quantas mensagens foram enviadas com sucesso e quais falharam (mesmos diagnósticos de `/gerente-enviar-relatorio`, Passo 7). Registre em `minhas-empresas/{ativa}/memoria/gerente-ia.md` que as boas-vindas deste mês foram enviadas, para não repetir sem querer.
