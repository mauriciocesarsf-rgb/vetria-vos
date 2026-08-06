---
name: vetria:configurar-geracao-imagem
description: Guia para criar uma conta na OpenRouter e conectar a geração de imagem, usada pelo Gerente IA, Vetria Marketing e Vetria Stylist para gerar imagens sem sair do Claude Code.
allowed-tools: Read, Edit, Bash
model: sonnet
---

# Configurar Geração de Imagem

Guia interativo para habilitar a geração de imagem direto no Claude Code (Gerente IA, Vetria Marketing e Vetria Stylist). Sem isso, os agents continuam funcionando normalmente — só entregam o prompt pronto, pra usar em outra ferramenta.

## O que isso faz?

Com a chave configurada, ao pedir uma prancha, look ou imagem, você pode escolher gerar a imagem ali mesmo, além de sempre receber o prompt como alternativa.

**Custo:** a OpenRouter cobra por uso (pré-pago, você adiciona crédito). Geração de imagem custa centavos por imagem, varia por modelo.

## Passo 0. Verificar se já está configurado

Leia `.env`. Verifique `OPENROUTER_API_KEY`. Se já tiver valor, teste (Passo 3). Se passar, informe que já está tudo pronto e encerre.

## Passo 1. Criar conta e pegar a chave

```
1. Acesse https://openrouter.ai e crie sua conta.
2. Adicione crédito: menu "Credits" > escolha um valor (pode começar pequeno, R$20-50 pra testar).
3. Vá em "Keys" (https://openrouter.ai/keys) > "Create Key".
4. Copie a chave gerada (começa com "sk-or-").

Cole a chave aqui.
```

## Passo 2. Salvar no `.env`

Leia `.env`. Atualize ou adicione `OPENROUTER_API_KEY`.

## Passo 3. Testar

Use exatamente o mecanismo da skill `gerar-imagem` (Passo 2 — chamada via Node, nunca carregando base64 no contexto) com um prompt simples de teste ("a simple red circle on white background") e destino `/tmp/vetria-teste-imagem.png`.

- Se o script imprimir `OK /tmp/vetria-teste-imagem.png`: configuração funcionando.
- `401` no erro: chave inválida, peça pra colar de novo.
- `402` ou menção a crédito insuficiente: oriente a adicionar crédito em openrouter.ai/credits.
- Outro erro: mostre a mensagem bruta (truncada), ofereça WebSearch em `site:openrouter.ai` se não for óbvio.

## Passo 4. Confirmar

```
Geração de imagem configurada.

A partir de agora, o Gerente IA, o Vetria Marketing e o Vetria Stylist vão oferecer gerar a imagem direto, além do prompt pronto pra outras ferramentas.
```
