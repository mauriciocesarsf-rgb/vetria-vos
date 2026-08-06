---
name: vetria:configurar-canal-relatorio
description: Escolhe o canal para o relatório automático do Gerente IA (Telegram ou WhatsApp) e aciona o guia de configuração correspondente.
allowed-tools: Read
model: sonnet
---

# Escolher canal do relatório

Ponto de entrada para configurar onde o Gerente IA envia os relatórios de vendas. Chamado automaticamente por `/gerente-enviar-relatorio` quando nenhum canal está configurado, ou diretamente pelo usuário.

## Passo 1. Verificar se algum canal já está ativo

Leia `.env`. Verifique `GERENTE_CANAL_RELATORIO`.

- Se for `TELEGRAM` e `TELEGRAM_BOT_TOKEN` existir com pelo menos um dos dois destinos (`TELEGRAM_CHAT_ID_GRUPO` ou `TELEGRAM_CHAT_ID_GERENTE`): já está configurado nesse canal — se faltar o outro destino, acione `configurar-telegram` para completar. Senão informe e encerre.
- Se for `WHATSAPP` e as credenciais Z-API existirem com pelo menos um dos dois destinos: mesma lógica, acione `configurar-whatsapp` para completar o que faltar.
- Caso contrário: siga para o Passo 2.

## Passo 2. Perguntar o canal

```
Por qual canal o Gerente IA deve enviar os relatórios de vendas?

1. Telegram (Recomendado — gratuito, sem risco de bloqueio, sem limite de mensagens)
2. WhatsApp (o número conectado corre risco real de banimento)

Digite o número:
```

**Se escolher 1:** acione a skill `configurar-telegram`.

**Se escolher 2:** acione a skill `configurar-whatsapp`. Ela mesma vai pedir a confirmação de risco antes de continuar — não repita esse aviso aqui, só encaminhe.
