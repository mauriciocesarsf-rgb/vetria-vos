---
name: vetria:configurar-envio-automatico
description: Checklist pós-instalação — confirma canal/Telegram, define quais cadências de relatório automático ficam ativas (diário, semanal e/ou mensal, todas independentes entre si) e o horário de cada uma (sugerindo os padrões já testados, mas permitindo trocar), e quem recebe alerta se um envio falhar.
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

## Passo 2. Cadências

**As três cadências são independentes — a loja pode ligar quantas quiser ao mesmo tempo, cada uma com o próprio horário.** Não é "escolha uma", é "escolha quais":

```
Quais relatórios automáticos você quer receber? Pode marcar mais de um.

1. Diário — acompanhamento rápido de meta e ranking, todo dia
2. Semanal — fechamento da semana, com análise e recomendações, toda segunda
3. Mensal — fechamento do mês, com análise e recomendações, todo dia 1

Digite os números separados por vírgula (ex: 1,2,3), ou "todos":
```

(Quinzenal ainda não está disponível no envio automático — se pedirem, informe que por enquanto só dá pra usar `/gerente-enviar-relatorio` ou `/gerente-fechamento` manualmente nesse ritmo.)

## Passo 3. Horário de cada cadência escolhida

Pra cada cadência marcada no Passo 2, sugira o horário padrão já testado em produção, um de cada vez:

- Diário → sugestão: **10h**
- Semanal → sugestão: **15h** (toda segunda)
- Mensal → sugestão: **15h** (todo dia 1)

```
{Diário/Semanal/Mensal}, horário sugerido: {sugestão}. Serve, ou prefere outro horário?

1. Usar {sugestão}
2. Escolher outro horário
```

Se escolher outro, peça o horário no formato `HH:mm` (24h, fuso America/São_Paulo). Aceite qualquer horário válido — o sistema não fica preso aos horários padrão. Repita esse mini-checklist pra cada cadência marcada, sem precisar de confirmação extra entre uma e outra.

## Passo 4. Quem recebe alerta se o envio falhar

```
Se o envio automático falhar por algum motivo (ex: token do Telegram expirado, dado faltando), quem deve receber um aviso?

1. O gerente (TELEGRAM_CHAT_ID_GERENTE, se já configurado)
2. O mesmo grupo do relatório
3. Outro destino (Chat ID diferente)
4. Ninguém — só registrar no sistema, sem avisar
```

**Se opção 1:** use `TELEGRAM_CHAT_ID_GERENTE` do `.env`. Se não estiver configurado, avise que precisa rodar `/configurar-telegram` primeiro para o destino do gerente, ou escolher outra opção.
**Se opção 3:** peça o Chat ID diretamente (se o usuário já sabe) ou ofereça guiar como no Passo 1 de `/configurar-telegram` (adicionar o bot / iniciar conversa e ler `getUpdates`).
**Se opção 4:** não grava nenhum destino de erro — deixe claro que, nesse caso, uma falha só aparece nos registros internos, ninguém é avisado.

## Passo 5. Salvar no `.env`

Atualize ou adicione, uma cadência de cada vez conforme foi marcada (ou não) no Passo 2 — cadência não marcada grava `ATIVO=false`, nunca deixe de fora, senão o backend mantém o que já estava configurado antes:
- `GERENTE_RELATORIO_DIARIO_ATIVO` = `true` ou `false`
- `GERENTE_RELATORIO_DIARIO_HORARIO` = horário escolhido (só se ativo), formato `HH:mm`
- `GERENTE_RELATORIO_SEMANAL_ATIVO` = `true` ou `false`
- `GERENTE_RELATORIO_SEMANAL_HORARIO` = horário escolhido (só se ativo)
- `GERENTE_RELATORIO_MENSAL_ATIVO` = `true` ou `false`
- `GERENTE_RELATORIO_MENSAL_HORARIO` = horário escolhido (só se ativo)
- `TELEGRAM_CHAT_ID_ERRO` = Chat ID escolhido no Passo 4 (deixe vazio se a opção foi "ninguém")

## Passo 6. Confirmar

```
Envio automático configurado:

📤 Diário: {ativo às {horário} / desligado}
📤 Semanal: {ativo às {horário}, toda segunda / desligado}
📤 Mensal: {ativo às {horário}, todo dia 1 / desligado}
📬 Canal: {canal}
🚨 Alerta de erro: {destino do alerta, ou "nenhum configurado"}

A partir de agora, cada relatório ativo sai sozinho no ritmo dele — sem precisar abrir o Vetria nem apertar nada. Pra mudar depois, é só rodar este comando de novo.
```

Lembre que isso só tem efeito depois que os dados sincronizarem com o servidor — a primeira sincronização acontece automaticamente na próxima vez que o app for aberto.
