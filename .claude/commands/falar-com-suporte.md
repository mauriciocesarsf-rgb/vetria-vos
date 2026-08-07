---
name: vetria:falar-com-suporte
description: Coleta uma mensagem do usuário e envia pro administrador da plataforma (dúvida, problema técnico, sugestão) — sempre com uma cópia salva localmente, mesmo se o envio não estiver configurado.
allowed-tools: Read, Write, Bash
model: sonnet
---

# Falar com Suporte

Canal direto com quem administra essa instalação do Vetria VOS — pra dúvida sobre o próprio sistema, problema técnico, ou sugestão. Não é pra dúvida de gestão/marketing/moda da empresa (isso é com os especialistas).

## Passo 1. Coletar a mensagem

```
O que você quer reportar ou perguntar?
```

Aguarde. Não edite o que a pessoa escrever — a mensagem é dela, envie como foi escrita (só adicione o contexto do Passo 2 em volta).

## Passo 2. Montar o envio

```
Suporte — {nome da empresa, se houver empresa ativa}
{data de hoje}

{mensagem da pessoa}
```

## Passo 3. Salvar uma cópia local (sempre, independente de envio)

Salve em `minhas-empresas/{ativa}/entregas/suporte/{AAAA-MM-DD}-{hora}.md` (se não houver empresa ativa, salve em `entregas-suporte-avulsas/{AAAA-MM-DD}-{hora}.md` na raiz do projeto). Isso garante que a mensagem não se perde mesmo se o envio falhar.

## Passo 4. Enviar (se configurado)

Leia `.env`. Verifique `TELEGRAM_BOT_TOKEN` e `VOS_ADMIN_TELEGRAM_CHAT_ID`.

**Se faltar algum:** informe que a mensagem foi salva localmente (Passo 3) mas o envio automático não está configurado, e ofereça rodar `/configurar-suporte` agora ou deixar pra depois — a cópia local já garante que nada se perde.

**Se os dois existirem:**
```bash
TMPFILE=$(mktemp)
cat > "$TMPFILE" <<'EOF'
{MENSAGEM MONTADA NO PASSO 2}
EOF
curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${VOS_ADMIN_TELEGRAM_CHAT_ID}" \
  --data-urlencode "text@${TMPFILE}"
rm "$TMPFILE"
```

- `{"ok":true,...}`: informe "Mensagem enviada."
- 401/"Unauthorized": token inválido, oriente `/configurar-suporte`.
- `"chat not found"`: Chat ID errado, oriente `/configurar-suporte`.

Nunca imprima `TELEGRAM_BOT_TOKEN` no chat.

## Passo 5. Confirmar

Informe onde a cópia local ficou salva e se o envio deu certo ou não.
