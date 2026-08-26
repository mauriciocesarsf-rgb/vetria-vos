---
name: vetria:configurar-telegram
description: Guia para criar um bot no Telegram via BotFather e obter os Chat IDs de destino — o grupo da loja (relatório de faturamento/ranking) e o gerente (mensagens individuais por vendedor).
allowed-tools: Read, Edit, Bash, WebSearch
model: sonnet
---

# Configurar Telegram

Guia interativo para criar o bot e conectar os dois destinos usados pelo Gerente IA. Canal recomendado: gratuito, sem risco de bloqueio, sem limite de mensagens.

## O que isso faz?

O Gerente IA usa dois destinos diferentes, que podem ser o mesmo chat ou não:
- **Grupo da loja** — recebe o relatório de faturamento/ranking (`/gerente-enviar-relatorio`), pensado pra equipe inteira ver.
- **Gerente** — recebe as análises individuais do início do mês (`/gerente-boas-vindas-mes`), uma por vendedor, pra ele revisar e encaminhar. Nunca vai direto pro vendedor nem pro grupo.

Você cria o bot em 2 minutos, sem programar nada.

**Custo:** zero, sempre.

## Passo 0. Verificar o que já está configurado

Leia `.env`. Verifique `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID_GRUPO` e `TELEGRAM_CHAT_ID_GERENTE`.

- **Sem token:** siga para o Passo 1 (configuração completa, os dois destinos).
- **Com token, faltando um ou os dois Chat IDs:** pule para o Passo 3, só para o(s) destino(s) que faltam.
- **Tudo preenchido:** teste o envio (Passo 4) nos dois. Se passar, informe que já está tudo pronto e encerre.

## Passo 1. Criar o bot no BotFather

```
Você já tem um bot do Telegram criado?

1. Sim, já tenho o token do bot
2. Não tenho ainda
```

**Se não tiver:** a pessoa do outro lado pode nunca ter feito nada parecido — trate cada tela como se fosse a primeira vez dela usando um app de mensagens pra algo técnico. Mostre uma ilustração por sub-passo (nunca despeje o passo a passo inteiro de uma vez), e espere a confirmação antes de seguir pra próxima.

Copie `assets/tutoriais/telegram-passo1-buscar.png` para `minhas-empresas/{ativa}/entregas/gestao/imagens/tutorial-telegram-passo1.png` (crie a pasta se não existir) e mostre, referenciando esse caminho na resposta:
```
Vamos criar seu bot, leva 2 minutos. Primeiro:

1. Abra o Telegram
2. Na busca, digite @BotFather e toque no resultado (é o bot oficial, vem com esse nome exato)

entregas/gestao/imagens/tutorial-telegram-passo1.png

Me avisa quando estiver na conversa com o BotFather.
```

Depois de confirmado, copie `assets/tutoriais/telegram-passo2-criar.png` para `.../imagens/tutorial-telegram-passo2.png` e mostre:
```
Agora, dentro da conversa com o BotFather:

1. Envie o comando /newbot (só isso, sem mais nada na mensagem)
2. Ele vai perguntar um nome pro bot — pode ser "Vetria {nome da loja}"
3. Depois vai pedir um username, que precisa terminar em "bot" — sugestão: vetria_{algo curto da loja}_bot

entregas/gestao/imagens/tutorial-telegram-passo2.png

Manda um "ok" ou já cola aqui o que o BotFather respondeu, o que for mais fácil.
```

Por fim, copie `assets/tutoriais/telegram-passo3-token.png` para `.../imagens/tutorial-telegram-passo3.png` e mostre:
```
Perfeito. O BotFather agora respondeu com um token, uma linha comprida começando com números e dois pontos, tipo 123456789:AAF...

entregas/gestao/imagens/tutorial-telegram-passo3.png

Copia essa linha inteira e cola aqui pra mim.
```

**Se já tiver:** peça o token.

## Passo 2. Testar o token

```bash
curl -s "https://api.telegram.org/bot{TOKEN_INFORMADO}/getMe" | head -c 300
```

- `{"ok":true,...}`: continua.
- `{"ok":false,...}` ou 401: token inválido, peça para colar de novo.

## Passo 3. Obter os Chat IDs

Faça isso para cada destino que ainda falta (grupo e/ou gerente).

**Destino: grupo da loja**

Copie `assets/tutoriais/telegram-passo4-grupo.png` para `minhas-empresas/{ativa}/entregas/gestao/imagens/tutorial-telegram-passo4.png` (crie a pasta se não existir) e mostre:
```
1. Abra o grupo da loja no Telegram, vá em Adicionar membro
2. Busque o nome de usuário do bot que você criou (termina em "bot") e adicione ele
3. Depois, envie qualquer mensagem no grupo, pode ser só "oi"

entregas/gestao/imagens/tutorial-telegram-passo4.png

Me avisa quando fizer isso.
```

**Destino: gerente**
```
1. Abra o Telegram e busque o bot pelo username que você criou.
2. Clique em "Iniciar" (ou envie qualquer mensagem, se já tiver iniciado antes) — na conversa pessoal do próprio gerente, não num grupo.
3. Me avise quando fizer isso.
```

Depois de cada confirmação, rode:
```bash
curl -s "https://api.telegram.org/bot{TOKEN}/getUpdates"
```

No JSON, localize o `chat.id` da conversa/grupo mais recente (grupo costuma vir com `id` negativo). Esse é o Chat ID daquele destino.

Se `result` vier vazio: peça para repetir o passo (iniciar conversa ou mandar mensagem no grupo) e rode de novo.

## Passo 4. Testar o envio

Para cada destino configurado:
```bash
curl -s -X POST "https://api.telegram.org/bot{TOKEN}/sendMessage" -H "Content-Type: application/json" -d "{\"chat_id\":\"{CHAT_ID}\",\"text\":\"Vetria conectada. Este canal vai receber mensagens do Gerente IA.\"}"
```

- `{"ok":true,...}`: peça para o usuário confirmar que recebeu, no destino certo (grupo ou conversa pessoal do gerente).
- 401: token inválido, repita o Passo 2.
- `"chat not found"`: Chat ID errado, repita o Passo 3 para esse destino.

## Passo 4.5. Mais alguém autorizado a conversar com a Vetria (opcional)

Só o "gerente" (Chat ID do Passo 3) pode conversar com a Vetria pelo Telegram — qualquer outra mensagem é ignorada, de propósito, pra ninguém sem querer disparar uma execução ou digitar um dado errado. Se mais de uma pessoa precisa poder conversar (ex: gerente + sub-gerente), pergunte:

```
Só você (gerente) vai poder conversar com a Vetria pelo Telegram, ou tem mais alguém que deveria poder também?
```

Se tiver mais alguém: repita o Passo 3 ("Destino: gerente") pra cada pessoa nova — pedir pra ela iniciar conversa com o bot, rodar `getUpdates`, achar o `chat.id` dela. Guarde os IDs numa lista separada por vírgula (nunca substitua o Chat ID do gerente principal, que continua sendo o destino dos relatórios automáticos — isso aqui só amplia quem pode *conversar*, não quem *recebe relatório*).

## Passo 5. Salvar no `.env`

Leia `.env`. Atualize ou adicione `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID_GRUPO` e/ou `TELEGRAM_CHAT_ID_GERENTE` (só os que foram configurados agora). Se o Passo 4.5 rendeu números extras, salve em `TELEGRAM_CHAT_IDS_AUTORIZADOS` (separados por vírgula, sem espaço — ex: `111111,222222`). Adicione também `GERENTE_CANAL_RELATORIO=TELEGRAM` se ainda não existir.

Confirme:
```
Telegram configurado e testado com sucesso.
Grupo da loja: {configurado/não configurado}
Gerente: {configurado/não configurado}

Use /gerente-enviar-relatorio (grupo) ou /gerente-boas-vindas-mes (gerente) quando quiser enviar.
```

## Perguntas frequentes

**Os dois destinos podem ser o mesmo chat?** Sim, se preferir receber tudo no mesmo lugar, use o mesmo Chat ID nas duas variáveis.
**O bot vê outras conversas minhas?** Não, só o que é enviado direto pra ele.
**Perdi o token?** No Telegram, fale com @BotFather, envie `/mybots`, selecione o bot, "API Token". Rode este comando de novo para atualizar.

## Se alguma tela ou opção não bater com o guia

Faça WebSearch em `site:core.telegram.org BotFather criar bot token`, adapte as instruções, e informe o link oficial https://core.telegram.org/bots se ainda assim não resolver.
