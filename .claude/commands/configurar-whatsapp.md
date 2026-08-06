---
name: vetria:configurar-whatsapp
description: Guia para criar conta na Z-API, conectar o WhatsApp e escolher o contato ou grupo que vai receber os relatórios automáticos do Gerente IA.
allowed-tools: Read, Edit, Bash
model: sonnet
---

# Configurar WhatsApp

Guia interativo para conectar o WhatsApp e escolher quem recebe os relatórios do Gerente IA. Só precisa fazer uma vez.

## O que é a Z-API?

Um serviço que permite ao Gerente IA enviar relatórios de vendas automaticamente pelo WhatsApp, sem ninguém precisar copiar e colar nada.

**Custo:** plano gratuito limitado para testes. Plano pago a partir de ~R$ 60/mês por instância.

## Passo 0. Verificar se já está configurado

Leia `.env`. Verifique `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN` (credenciais, compartilhadas pelos dois destinos), `GERENTE_WHATSAPP_TIPO_GRUPO`/`GERENTE_WHATSAPP_DESTINO_GRUPO` (destino do relatório de grupo) e `GERENTE_WHATSAPP_DESTINO_GERENTE` (número pessoal do gerente, para as mensagens individuais).

**Se as credenciais existem e os dois destinos também:** teste a instância (Passo 3). Se passar, informe que já está tudo configurado. Senão, encerre aqui.

**Se as credenciais existem mas falta um ou os dois destinos:** pule direto para o Passo 4, só para o(s) destino(s) que faltam — não repita o Passo 0.5 nem a conexão da instância, isso já foi feito.

**Se não há credenciais:** siga para o Passo 0.5. Não pule esse passo — ele é obrigatório mesmo que o usuário já tenha dito antes que quer WhatsApp.

## Passo 0.5. Confirmação de risco (obrigatória)

O WhatsApp não tem uma forma oficial e gratuita de automação como o Telegram tem. A conexão usada aqui (Z-API) simula um WhatsApp Web, e o WhatsApp pode banir o número conectado a qualquer momento, sem aviso prévio.

Pergunte primeiro:
```
Antes de conectar, você já configurou ou considerou o Telegram? Ele é gratuito e não tem risco de bloqueio.

1. Quero seguir com WhatsApp mesmo assim
2. Prefiro usar Telegram no lugar
```

Se escolher 2: acione a skill `configurar-telegram` e encerre este fluxo.

Se escolher 1, mostre o aviso completo e exija confirmação explícita:
```
Um ponto importante antes de continuar:

Se você conectar o número principal da loja (o mesmo que os clientes já conhecem), um banimento significa perder esse canal de comunicação real com os clientes — não só o relatório automático.

Recomendação: use um número secundário, que não seja o principal da operação.

Para continuar, escreva exatamente:
"entendo o risco e quero conectar pelo WhatsApp mesmo assim"
```

Não aceite "sim", "ok", "pode ser" ou qualquer resposta vaga como confirmação — só a frase pedida (ou equivalente inequívoco que demonstre que a pessoa leu o aviso). Se a resposta for vaga, repita o aviso uma vez; se insistir vago, oriente a usar Telegram. Só avance para o Passo 1 após confirmação clara.

## Passo 1. Criar conta e conectar a instância

```
Você já tem conta na Z-API?

1. Sim, já tenho
2. Não tenho ainda
```

Se não tiver, instrua:
```
1. Acesse https://app.z-api.io e crie sua conta.
2. No menu lateral, clique em "Instâncias Web" > "Adicionar".
3. Dê um nome (ex: "Vetria Relatórios") e salve.
4. Abra a instância criada, clique em "Assinar" (necessário para liberar o QR Code).
5. Escaneie o QR Code com o WhatsApp que vai enviar os relatórios (use o número secundário, não o principal da loja).
6. Aguarde a confirmação de conexão.

Quando estiver conectado, me avise.
```

## Passo 2. Copiar as credenciais

```
Preciso de 3 dados da sua instância:

1. Instance ID e Token: aparecem na tela da instância, após conectar.
2. Client-Token: menu lateral > "Segurança" > "Gerar Token de segurança da conta" (só aparece uma vez, copie e guarde).
```

Peça uma de cada vez: Instance ID, Token, Client-Token.

## Passo 3. Testar a instância

```bash
curl -s "https://api.z-api.io/instances/{INSTANCE_ID}/token/{TOKEN}/status" -H "Client-Token: {CLIENT_TOKEN}"
```

- `{"connected":true}`: avance para o Passo 4.
- `{"connected":false}`: WhatsApp não conectado. Oriente a voltar ao Passo 1 e escanear o QR Code de novo.
- Erro de assinatura: oriente a acessar app.z-api.io, abrir a instância e clicar em "Assinar".
- 401/unauthorized: credenciais inválidas, peça para colar de novo.

## Passo 4. Escolher os destinos

O Gerente IA usa dois destinos diferentes. Configure os que ainda faltarem.

**Destino: grupo da loja** (recebe `/gerente-enviar-relatorio` — faturamento/ranking, a equipe toda vê)
```
Para onde vai o relatório de grupo?

1. Um contato individual
2. Um grupo do WhatsApp (o mais comum aqui — ex: o grupo da equipe da loja)
```

Se contato: peça o número com DDI e DDD, sem espaços ou símbolos (ex: `5511999998888`). Salve `GERENTE_WHATSAPP_TIPO_GRUPO=CONTATO` e `GERENTE_WHATSAPP_DESTINO_GRUPO={numero}`.

Se grupo: a Z-API identifica grupos por um ID, não pelo nome. Busque a lista de grupos conectados:
```bash
curl -s "https://api.z-api.io/instances/{INSTANCE_ID}/token/{TOKEN}/chats" -H "Client-Token: {CLIENT_TOKEN}"
```
Filtre os itens cujo `phone` termina em `@g.us` e mostre a lista de nomes:
```
Encontrei estes grupos conectados ao seu WhatsApp:

1. {nome do grupo 1}
2. {nome do grupo 2}
...

Qual é o grupo da loja?
```
Se a lista vier vazia ou o grupo não aparecer, oriente a enviar qualquer mensagem no grupo pelo celular conectado e tentar de novo. Salve `GERENTE_WHATSAPP_TIPO_GRUPO=GRUPO` e `GERENTE_WHATSAPP_DESTINO_GRUPO={phone do grupo, com o sufixo @g.us}`.

**Destino: gerente** (recebe `/gerente-boas-vindas-mes` — análises individuais por vendedor, só o gerente vê e decide o que encaminhar. Sempre um contato individual, nunca um grupo.)
```
Qual o número do WhatsApp do gerente (com DDI e DDD, sem espaços ou símbolos)?
```
Salve `GERENTE_WHATSAPP_DESTINO_GERENTE={numero}`.

## Passo 5. Salvar no `.env`

Leia `.env`. Para cada variável configurada (`ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN`, `GERENTE_WHATSAPP_TIPO_GRUPO`, `GERENTE_WHATSAPP_DESTINO_GRUPO`, `GERENTE_WHATSAPP_DESTINO_GERENTE`, `GERENTE_CANAL_RELATORIO=WHATSAPP`): atualize se já existir a linha, senão adicione ao final.

Nunca exiba o Client-Token nem o Token completos no chat depois de salvos — confirme apenas que foram salvos.

## Passo 6. Confirmar

```
WhatsApp configurado.

Grupo da loja: {tipo/número mascarado, ou "não configurado"}
Gerente: {número mascarado, ou "não configurado"}
Status: conectado

Use /gerente-enviar-relatorio (grupo) ou /gerente-boas-vindas-mes (gerente) quando quiser enviar.
```

## Se o usuário não encontrar uma tela ou opção descrita

As interfaces mudam. Se o usuário não encontrar algo, faça WebSearch em `site:developer.z-api.io` pelo passo específico e adapte as instruções. Se não resolver, oriente a consultar https://developer.z-api.io diretamente.
