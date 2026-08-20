---
name: vetria:marketing-sugestao-do-dia
description: Lê o calendário editorial do mês, monta a sugestão de conteúdo de hoje e envia para o canal pessoal do gestor, com confirmação antes de enviar.
allowed-tools: Read, Bash
model: sonnet
---

# Vetria Marketing. Sugestão do Dia

Executa imediatamente: envia a sugestão de conteúdo de hoje para o gestor. Pensado para rodar toda manhã — agende com a skill `schedule` se quiser automático.

## Passo 1. Verificar canal configurado

Este comando usa o **destino pessoal do gestor** — o mesmo canal usado por `/gerente-boas-vindas-mes`, não o de grupo. Leia `.env`. Verifique `GERENTE_CANAL_RELATORIO`.

- **Vazio ou ausente:** acione a skill `configurar-canal-relatorio`, depois retorne.
- **`TELEGRAM`:** verifique `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID_GERENTE`. Se faltar, acione `configurar-telegram`, depois retorne.
- **`WHATSAPP`:** verifique `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN`, `GERENTE_WHATSAPP_DESTINO_GERENTE`. Se faltar, acione `configurar-whatsapp`, depois retorne.

## Passo 2. Ler o calendário de hoje

Leia `minhas-empresas/.ativa`. Leia `minhas-empresas/{ativa}/dna/marketing/calendario-{AAAA-MM do mês corrente}.md`.

- Se o calendário do mês não existir: informe e oriente a rodar `/marketing-criar-calendario` primeiro. Encerre.
- Encontre a entrada de hoje — desde que o calendário tenha sido gerado com o ritmo semanal (todo dia tem uma linha, gancho real ou ritmo-base), deveria sempre existir uma.
- **Se ainda assim não houver entrada pra hoje** (calendário antigo, gerado antes do ritmo-base existir): leia `minhas-empresas/{ativa}/dna/marketing/estrategia-midias-sociais.md` e use a sugestão do dia da semana de lá. Só informe que não há sugestão se nem o calendário nem esse arquivo tiverem nada pra hoje — nunca invente.

Verifique também `dna/marketing/corridas-conteudo.csv`, se existir — filtre as linhas cujo período (`periodo_inicio` a `periodo_fim`) cobre hoje. Havendo uma corrida vigente, ela vira um lembrete curto extra na mensagem (Passo 3), reforçando o tema do dia — não substitui a sugestão principal.

## Passo 3. Montar a mensagem

```
📅 Sugestão de hoje — {NOME_EMPRESA}

🎯 Tema: {tema/data do dia}
📱 Formato: {formato sugerido}

💡 Ideia: {conteúdo sugerido, adaptado ao tom de comunicação da empresa}
```

Se houver corrida de conteúdo vigente (ver Passo 2), acrescente uma linha final:
```

🏁 Lembrete: a corrida "{tema da corrida}" está rodando até {periodo_fim} — {critério resumido em poucas palavras}.
```

## Passo 4. Confirmar e enviar

Mostre a prévia e pergunte se pode enviar (opções: sim / não). Se sim, envie usando a mesma lógica de `/gerente-boas-vindas-mes` Passo 5 (destino `_GERENTE`, arquivo temporário, nunca credenciais na linha de comando).

## Passo 5. Resultado

Mesmos diagnósticos de erro de `/gerente-enviar-relatorio` Passo 7. Em sucesso, informe "Sugestão enviada."
