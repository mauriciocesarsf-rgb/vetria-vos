---
name: vetria:configurar-telegram
description: Guia para adicionar o bot da Vetria (compartilhado, já pronto) no grupo da loja e no contato do gerente, e obter os Chat IDs de destino.
allowed-tools: Read, Edit, Bash, WebSearch
model: sonnet
---

# Configurar Telegram

Guia interativo para conectar os dois destinos usados pelo Gerente IA. Canal recomendado: gratuito, sem risco de bloqueio, sem limite de mensagens.

## O que isso faz?

O Gerente IA usa dois destinos diferentes, que podem ser o mesmo chat ou não:
- **Grupo da loja** — recebe o relatório de faturamento/ranking (`/gerente-enviar-relatorio`), pensado pra equipe inteira ver.
- **Gerente** — recebe as análises individuais do início do mês (`/gerente-boas-vindas-mes`), uma por vendedor, pra ele revisar e encaminhar. Nunca vai direto pro vendedor nem pro grupo.

**Achado real, 2026-09-02: o bot é único e compartilhado entre todas as lojas** (o backend sempre manda mensagem por ele, não importa a loja — ver comentário em `vetria-backend/src/config.ts`). Por isso não existe mais etapa de criar bot: `TELEGRAM_BOT_TOKEN` já vem preenchido sozinho desde a instalação do app (ver `TELEGRAM_BOT_TOKEN_COMPARTILHADO` em `vetria-instalador/electron/main.js`). Só falta adicionar o bot que já existe nos dois destinos e pegar o Chat ID de cada um.

Leva 1 minuto, sem programar nada. **Custo:** zero, sempre.

## Passo 0. Verificar o que já está configurado

Leia `.env`. `TELEGRAM_BOT_TOKEN` já deve estar preenchido (gravado sozinho na instalação) — se por algum motivo estiver vazio, avise o usuário que algo saiu errado na instalação e sugira reabrir o app antes de continuar (isso reescreve o valor sozinho).

Verifique `TELEGRAM_CHAT_ID_GRUPO` e `TELEGRAM_CHAT_ID_GERENTE`:
- **Faltando um ou os dois:** siga pro Passo 1, só para o(s) destino(s) que faltam.
- **Tudo preenchido:** teste o envio (Passo 2) nos dois. Se passar, informe que já está tudo pronto e encerre.

Descubra o username público do bot compartilhado rodando:
```bash
curl -s "https://api.telegram.org/bot{TOKEN_DO_ENV}/getMe" | head -c 300
```
Guarde o `username` retornado (ex: `Vetria_ai_bot`) — vai usar no Passo 1. Se der erro (`ok:false` ou 401), o token do `.env` está desatualizado: avise o usuário e não prossiga sem antes reabrir o app pra corrigir sozinho.

## Passo 1. Adicionar o bot e obter os Chat IDs

A pessoa do outro lado pode nunca ter feito nada parecido — trate cada tela como se fosse a primeira vez dela usando um app de mensagens pra algo técnico. Mostre uma ilustração por sub-passo, e espere a confirmação antes de seguir pra próxima. Faça isso para cada destino que ainda falta (grupo e/ou gerente).

**Destino: grupo da loja**

Copie `assets/tutoriais/telegram-passo1-buscar.png` para `minhas-empresas/{ativa}/entregas/gestao/imagens/tutorial-telegram-passo1.png` (crie a pasta se não existir) e mostre:
```
Vamos conectar o Telegram, leva 1 minuto. No grupo da loja:

1. Abra o grupo no Telegram, vá em Adicionar membro
2. Busque @{username do bot, ex: Vetria_ai_bot} e adicione ele
3. Depois, envie qualquer mensagem no grupo, pode ser só "oi"

entregas/gestao/imagens/tutorial-telegram-passo1.png

Me avisa quando fizer isso.
```

**Destino: gerente**

Copie `assets/tutoriais/telegram-passo5-grupo.png` para `minhas-empresas/{ativa}/entregas/gestao/imagens/tutorial-telegram-passo-gerente.png` e mostre:
```
Agora no seu privado:

1. No Telegram, busque @{username do bot} e abra a conversa
2. Toque em "Iniciar" (ou mande qualquer mensagem, se já tiver iniciado antes)
3. Me avise quando fizer isso.

entregas/gestao/imagens/tutorial-telegram-passo-gerente.png
```

Depois de cada confirmação, rode:
```bash
curl -s "https://api.telegram.org/bot{TOKEN_DO_ENV}/getUpdates"
```

No JSON, localize o `chat.id` da conversa/grupo mais recente (grupo costuma vir com `id` negativo). Esse é o Chat ID daquele destino.

Se `result` vier vazio: peça para repetir o passo (iniciar conversa ou mandar mensagem no grupo) e rode de novo.

## Passo 2. Testar o envio

Para cada destino configurado:
```bash
curl -s -X POST "https://api.telegram.org/bot{TOKEN_DO_ENV}/sendMessage" -H "Content-Type: application/json" -d "{\"chat_id\":\"{CHAT_ID}\",\"text\":\"Vetria conectada. Este canal vai receber mensagens do Gerente IA.\"}"
```

- `{"ok":true,...}`: peça para o usuário confirmar que recebeu, no destino certo (grupo ou conversa pessoal do gerente).
- `"chat not found"`: Chat ID errado, repita o Passo 1 pra esse destino.
- 401: token do `.env` desatualizado — avise o usuário e sugira reabrir o app pra corrigir sozinho.

## Passo 2.5. Mais alguém autorizado a conversar com a Vetria (opcional)

Só o "gerente" (Chat ID do Passo 1) pode conversar com a Vetria pelo Telegram — qualquer outra mensagem é ignorada, de propósito, pra ninguém sem querer disparar uma execução ou digitar um dado errado. Se mais de uma pessoa precisa poder conversar (ex: gerente + sub-gerente), pergunte:

```
Só você (gerente) vai poder conversar com a Vetria pelo Telegram, ou tem mais alguém que deveria poder também?
```

Se tiver mais alguém: repita o Passo 1 ("Destino: gerente") pra cada pessoa nova — pedir pra ela iniciar conversa com o bot, rodar `getUpdates`, achar o `chat.id` dela. Guarde os IDs numa lista separada por vírgula (nunca substitua o Chat ID do gerente principal, que continua sendo o destino dos relatórios automáticos — isso aqui só amplia quem pode *conversar*, não quem *recebe relatório*).

## Passo 3. Salvar no `.env`

Leia `.env`. Atualize ou adicione `TELEGRAM_CHAT_ID_GRUPO` e/ou `TELEGRAM_CHAT_ID_GERENTE` (só os que foram configurados agora) — `TELEGRAM_BOT_TOKEN` não precisa ser tocado, já está certo desde a instalação. Se o Passo 2.5 rendeu números extras, salve em `TELEGRAM_CHAT_IDS_AUTORIZADOS` (separados por vírgula, sem espaço — ex: `111111,222222`). Adicione também `GERENTE_CANAL_RELATORIO=TELEGRAM` se ainda não existir.

Confirme:
```
Telegram configurado e testado com sucesso.
Grupo da loja: {configurado/não configurado}
Gerente: {configurado/não configurado}

Use /gerente-enviar-relatorio (grupo) ou /gerente-boas-vindas-mes (gerente) quando quiser enviar.
```

**Se este comando foi acionado durante a SEQUÊNCIA DE ATIVAÇÃO (`CLAUDE.md`) e não avulso pelo usuário: essa confirmação acima nunca é o fim da resposta.** Emende direto, na mesma mensagem, pra próxima etapa da sequência (Vendedores) — não pare esperando o usuário perguntar "e agora?".

## Perguntas frequentes

**Os dois destinos podem ser o mesmo chat?** Sim, se preferir receber tudo no mesmo lugar, use o mesmo Chat ID nas duas variáveis.
**O bot vê outras conversas minhas?** Não, só o que é enviado direto pra ele.
**O bot não aparece na busca, ou dá erro ao adicionar?** Confirme o username com `getMe` (Passo 0) — pode ter mudado. Se continuar sem achar, veja a seção abaixo.

## Se alguma tela ou opção não bater com o guia

Faça WebSearch em `site:telegram.org adicionar bot em grupo`, adapte as instruções, e informe o link oficial https://core.telegram.org/bots se ainda assim não resolver.
