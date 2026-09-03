---
name: vetria:configurar-suporte
description: Conecta o canal de contato direto com o administrador da plataforma (quem administra essa instalação do Vetria VOS), usado por /falar-com-suporte.
allowed-tools: Read, Edit, Bash
model: sonnet
---

# Configurar Suporte

Guia pra conectar o canal que recebe mensagens de suporte enviadas pelo comando `/falar-com-suporte`. Esse contato é de quem **administra essa instalação do Vetria** (hoje, você) — não confundir com o canal de relatório da loja (`/configurar-canal-relatorio`), que é outra coisa.

## Passo 0. Verificar o que já está configurado

Leia `.env`. Verifique `TELEGRAM_BOT_TOKEN` e `VOS_ADMIN_TELEGRAM_CHAT_ID`.

- **Já tem os dois:** teste (Passo 3). Se passar, informe que já está pronto e encerre.
- **Tem `TELEGRAM_BOT_TOKEN`** (configurado antes via `/configurar-telegram`), **falta só o Chat ID do admin:** pule pro Passo 2.
- **Não tem token nenhum:** siga do Passo 1.

## Passo 1. Bot do Telegram

`TELEGRAM_BOT_TOKEN` já vem preenchido sozinho desde a instalação do app (bot compartilhado — ver `TELEGRAM_BOT_TOKEN_COMPARTILHADO` em `vetria-instalador/electron/main.js`), então na prática esse passo quase nunca precisa fazer nada. Se por algum motivo estiver mesmo vazio no `.env`, avise o usuário e sugira reabrir o app antes de continuar (isso reescreve o valor sozinho) — não peça pra criar bot nenhum.

## Passo 2. Chat ID do administrador

```
1. Abra o Telegram e busque o bot pelo username criado.
2. Clique em "Iniciar" (ou mande qualquer mensagem, na conversa pessoal sua, não num grupo).
3. Me avise quando fizer isso.
```

Depois da confirmação:
```bash
curl -s "https://api.telegram.org/bot{TOKEN}/getUpdates"
```

Localize o `chat.id` da conversa mais recente. Esse é o `VOS_ADMIN_TELEGRAM_CHAT_ID`.

## Passo 3. Testar

```bash
curl -s -X POST "https://api.telegram.org/bot{TOKEN}/sendMessage" -H "Content-Type: application/json" -d "{\"chat_id\":\"{CHAT_ID}\",\"text\":\"Canal de suporte do Vetria VOS conectado.\"}"
```

`{"ok":true,...}`: peça confirmação de recebimento. Erros: mesma tabela do `/configurar-telegram` (Passo 2).

## Passo 4. Salvar

Leia `.env`. Atualize/adicione `TELEGRAM_BOT_TOKEN` (se ainda não existir) e `VOS_ADMIN_TELEGRAM_CHAT_ID`.

```
Suporte configurado. Qualquer empresa usando essa instalação pode usar /falar-com-suporte a partir de agora.
```
