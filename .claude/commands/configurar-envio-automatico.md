---
name: vetria:configurar-envio-automatico
description: Checklist pós-instalação — confirma canal/Telegram, define frequência e horário do relatório automático (sugerindo os padrões já testados, mas permitindo trocar) e quem recebe alerta se um envio falhar.
allowed-tools: Read, Edit, Bash
model: sonnet
---

# Configurar envio automático

Roda depois que a Pasta DNA tem pelo menos os indicadores básicos preenchidos (`vendas.csv` com alguma linha, `corridas.csv` ou `meta-mensal-loja.csv`). É o alinhamento final antes do sistema começar a mandar relatório sozinho, sem ninguém precisar apertar nada.

## Passo 0. Conferir se a Pasta DNA tem o essencial

Leia `minhas-empresas/.ativa`. Verifique `dna/indicadores/vendas.csv` — se só tiver o cabeçalho (nenhuma linha de venda lançada), avise:

```
Antes de configurar o envio automático, vale ter pelo menos alguns dias de vendas lançados em vendas.csv — assim o primeiro relatório automático já sai com dado de verdade, não vazio. Quer configurar mesmo assim (e lançar as vendas depois) ou prefere lançar primeiro?
```

Se o usuário confirmar que quer seguir mesmo assim, continue normalmente — não bloqueia, só avisa.

## Passo 1. Canal configurado?

Leia `.env`. Verifique `GERENTE_CANAL_RELATORIO`.

- **Vazio ou ausente:** acione a skill `configurar-canal-relatorio` (ela mesma encaminha pra `configurar-telegram` ou `configurar-whatsapp`). Quando voltar com o canal configurado, continue no Passo 2.
- **Já configurado:** continue.

## Passo 2. Frequência

```
Com que frequência o relatório deve ser enviado automaticamente?

1. Diário
2. Semanal (toda segunda-feira)
3. Mensal (todo dia 1)

Digite o número:
```

(Quinzenal ainda não está disponível no envio automático — se pedirem, informe que por enquanto só dá pra usar `/gerente-enviar-relatorio` manualmente nesse ritmo.)

## Passo 3. Horário

Sugira o horário padrão de acordo com a frequência escolhida (já testado em produção, funciona bem pra a maioria das lojas):

- Diário → sugestão: **10h**
- Semanal → sugestão: **15h** (toda segunda)
- Mensal → sugestão: **15h** (todo dia 1)

```
Horário sugerido: {sugestão}. Serve, ou prefere outro horário?

1. Usar {sugestão}
2. Escolher outro horário
```

Se escolher outro, peça o horário no formato `HH:mm` (24h, fuso America/São_Paulo). Aceite qualquer horário válido — o sistema não fica preso aos horários padrão.

## Passo 4. Quem recebe alerta se o envio falhar

```
Se o envio automático falhar por algum motivo (ex: token do Telegram expirado, dado faltando), quem deve receber um aviso?

1. O gerente (TELEGRAM_CHAT_ID_GERENTE, se já configurado)
2. O mesmo grupo do relatório
3. Outro destino (Chat ID diferente)
4. Ninguém — só registrar no sistema, sem avisar
```

**Se opção 1:** use `TELEGRAM_CHAT_ID_GERENTE` do `.env`. Se não estiver configurado, avise que precisa rodar `/configurar-telegram` primeiro para o destino do gerente, ou escolher outra opção.
**Se opção 3:** peça o Chat ID diretamente (se o usuário já sabe) ou ofereça guiar como no Passo 3 de `/configurar-telegram` (adicionar o bot / iniciar conversa e ler `getUpdates`).
**Se opção 4:** não grava nenhum destino de erro — deixe claro que, nesse caso, uma falha só aparece nos registros internos, ninguém é avisado.

## Passo 5. Salvar no `.env`

Atualize ou adicione:
- `GERENTE_FREQUENCIA_RELATORIO` = `DIARIO`, `SEMANAL` ou `MENSAL`
- `GERENTE_HORARIO_RELATORIO` = horário escolhido, formato `HH:mm`
- `TELEGRAM_CHAT_ID_ERRO` = Chat ID escolhido no Passo 4 (deixe vazio se a opção foi "ninguém")

## Passo 6. Confirmar

```
Envio automático configurado:

📤 Frequência: {frequência} às {horário}
📬 Canal: {canal}
🚨 Alerta de erro: {destino do alerta, ou "nenhum configurado"}

A partir de agora, o relatório sai sozinho nesse ritmo — sem precisar abrir o Vetria nem apertar nada. Pra mudar depois, é só rodar este comando de novo.
```

Lembre que isso só tem efeito depois que os dados sincronizarem com o servidor — a primeira sincronização acontece automaticamente na próxima vez que o app for aberto.
