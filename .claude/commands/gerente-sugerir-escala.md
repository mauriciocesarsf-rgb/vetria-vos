---
name: vetria:gerente-sugerir-escala
description: Monta uma sugestão de escala de folgas para o mês seguinte, a partir da equipe ativa e da configuração salva por /gerente-configurar-escala, e manda para aprovação do gerente.
allowed-tools: Read, Write, Edit, Bash
model: sonnet
---

# Sugerir escala

Monta uma proposta de escala de folgas pro mês seguinte e manda pro canal configurado, pra o gerente aprovar. Não aplica nada sozinho sem aprovação — só sugere.

## Passo 0. Dados necessários

Leia `dna/indicadores/config-escala.md`. Se não existir (ou estiver com os placeholders do template, sem nada preenchido de verdade): pare e informe que é preciso rodar `/gerente-configurar-escala` primeiro. Não invente horário de funcionamento, tipo de escala ou regras trabalhistas.

Leia `dna/indicadores/vendas.csv` e extraia os vendedores com pelo menos uma linha lançada no mês corrente ou no anterior (mesma lógica de "quem está na loja" usada no resto do sistema — nunca uma lista fixa em outro arquivo). Sem nenhum vendedor: pare e explique que não há equipe suficiente em `vendas.csv` pra montar uma escala ainda.

Leia `dna/indicadores/escala-folgas.csv`, se existir, pra saber o dia de folga atual de cada vendedor (usado como ponto de partida — evita trocar o dia de folga de alguém sem necessidade).

## Passo 1. Definir o mês alvo

Por padrão, a sugestão é sempre pro **mês seguinte** ao mês corrente (é assim que dá tempo do gerente aprovar antes do mês começar). Se for chamado com uma instrução explícita de outro mês, use o mês pedido.

## Passo 2. Montar a distribuição

1. Dias da semana permitidos pra folga = os 7 dias da semana, **menos** os dias listados em "Dias que nunca podem ter folga" de `config-escala.md` que forem dias da semana recorrentes (ex: "sábado"). Se a lista tiver datas específicas (ex: "24/12") em vez de dias da semana, essas não entram nessa conta — anote como observação separada no final ("nenhum vendedor pode folgar em {data}", sem tentar encaixar isso num dia fixo semanal).
2. Se não sobrar nenhum dia permitido (todos os 7 dias proibidos, ou 6+ com poucos vendedores pra cobrir o único dia restante), pare e avise que a configuração atual não deixa nenhum dia viável pra folga — peça pra revisar `/gerente-configurar-escala`.
3. Pra cada vendedor ativo (ordem alfabética, pra ser determinístico):
   - Se ele já tem um dia de folga em `escala-folgas.csv` e esse dia ainda está entre os permitidos, mantenha esse dia (continuidade > otimização).
   - Senão, atribua o dia permitido com **menos vendedores já alocados** até aqui (equilíbrio de cobertura — evita todo mundo folgando no mesmo dia).
4. Ao final, se algum dia permitido ficou com muito mais gente que os outros (diferença de 2+ vendedores em relação ao dia menos carregado) e isso não for necessário pra manter continuidade de ninguém, redistribua o(s) vendedor(es) mais recente(s) desse dia pro dia menos carregado.
5. Cada vendedor tem exatamente 1 dia fixo de folga por semana no mês (modelo 6x1) — não é gerado rodízio semana a semana nessa versão, mesmo que `config-escala.md` registre preferência por rodízio (isso já foi avisado ao usuário em `/gerente-configurar-escala`, Passo 2).

## Passo 3. Montar a mensagem

```
📋 Sugestão de escala — {mês alvo}/{ano}

{para cada vendedor, uma linha}: {vendedor} → folga {dia da semana}

Base usada: {resumo de 1 frase da regra trabalhista de config-escala.md — ex: "convenção coletiva do comércio de {cidade}, folga semanal remunerada garantida"}
{se houver datas específicas sem folga}: ⚠️ Sem folga em: {lista de datas}

Essa é uma sugestão — confirma se pode aplicar, ou me diga o que ajustar (ex: trocar o dia de alguém específico).
```

## Passo 4. Registrar e enviar

Registre em `entregas/registro-atividades.md` uma entrada com título "Sugestão de escala — {mês alvo}/{ano}" e status **pendente validação** (mesmo padrão usado pros outros entregáveis do sistema).

**Se estiver rodando de forma interativa** (tem um usuário respondendo no momento): mostre a mensagem do Passo 3 aqui no chat primeiro. Se o usuário confirmar que pode aplicar, escreva o resultado em `dna/indicadores/escala-folgas.csv` (substituindo o conteúdo anterior pelas novas linhas `vendedor,dias_folga`) e atualize a entrada em `registro-atividades.md` pra **validado**. Se pedir ajustes, refaça a distribuição considerando o pedido e mostre de novo antes de aplicar.

**Se estiver rodando de forma automática e agendada** (sem usuário disponível pra responder — ex: acionado no fim do mês pelo backend): não aplique nada em `escala-folgas.csv` sozinho. Só envie a mensagem do Passo 3 pro canal configurado (mesma lógica de destino usada em `/gerente-enviar-relatorio` — `TELEGRAM_CHAT_ID_GERENTE` se configurado, senão o grupo) e deixe registrado como pendente validação. A aplicação de fato só acontece numa sessão futura, quando alguém confirmar.

## Passo 5. Sem canal configurado

Se `GERENTE_CANAL_RELATORIO` não estiver definido no `.env`, ainda assim monte e mostre a sugestão (Passo 3) — só não tenta enviar por nenhum canal, e avise que configurar um canal (`/configurar-canal-relatorio`) permite receber isso automaticamente todo mês.
