---
name: vetria:gerente-configurar-metas
description: Registra como a loja define suas metas (origem da meta, histórico fora do sistema, dias fortes e fracos, datas que mexem nas vendas e a regra de bonificação, se houver). Base para as sugestões de meta por dia.
allowed-tools: Read, Write, Edit
model: sonnet
---

# Configurar metas

Guarda o que o Gerente IA precisa saber sobre como esta loja trabalha suas metas. Roda uma vez, e de novo sempre que algo mudar. A Vetria analisa e recomenda; quem define as regras é sempre a loja. Nunca complete uma resposta que a pessoa não deu, e nunca trate a regra de uma loja como padrão para outra.

Uma pergunta por vez, em linguagem do dia a dia. Se a pessoa disser que não sabe ou quiser pular, registre "nenhum" ou deixe o campo sem preencher, e siga em frente.

## Passo 0. Ver o que já existe

Leia `minhas-empresas/.ativa`. Leia `dna/indicadores/config-metas.md`, se existir.

- **Não existe, ou nenhuma seção foi preenchida** (todas ainda só com o texto de exemplo entre parênteses, e `sim/nao` na linha de bonificação): siga para o Passo 1.
- **Já está preenchido:** mostre um resumo curto do que está salvo e pergunte o que quer mudar. Refaça só os passos que a pessoa escolher e mantenha o resto como está.

## Passo 1. Como a meta é definida hoje

```
Hoje, como a meta do mês é definida? Quem define e como ela chega até a equipe?
(ex: "a franqueadora manda a meta do mês e eu divido por semana", "eu defino olhando o mesmo mês do ano passado")
```

## Passo 2. Histórico fora do sistema

```
A loja tem vendas de meses ou anos anteriores guardadas em planilha ou em outro lugar, que ainda não foram lançadas aqui? Se tiver, me diga de que período são.
```

Se tiver histórico, oriente a guardar o arquivo em Documentos da Área Adm ou a mandar para lançamento. Nunca leia nem use esse histórico sem que ele esteja de fato em `vendas.csv` ou em `dna/documentos/`.

## Passo 3. Dias fortes e dias fracos

```
Pelo que vocês já sabem da loja, quais dias da semana ou do mês costumam ser mais fortes e quais mais fracos? (ex: "sábado é o mais forte", "segunda é fraca", "semana do pagamento vende mais")
```

## Passo 4. Datas e ações que mexem nas vendas

```
Quais datas ou ações costumam mudar o resultado da loja, e quanto? (ex: "Dia das Mães é o maior mês do ano", "a Black costuma dobrar a última semana")
```

Em seguida, mais uma pergunta, ainda neste passo:

```
Tem alguma particularidade da operação que mude como as metas devem ser pensadas? (ex: "o shopping fecha mais cedo aos domingos", "loja nova, vendas ainda crescendo", "reforma prevista em novembro". Se não tiver, responda "nenhuma")
```

Grave como a pessoa disse na seção "Particularidades da operação" (se for "nenhuma", escreva "nenhuma").

## Passo 5. Bonificação ligada à meta

```
A equipe tem bonificação ou comissão ligada à meta?

1. Sim
2. Não
```

- **Não:** registre `Bonificação ligada à meta: nao`, volte as linhas de comissão (percentuais, meta super, períodos, recuperação) e a explicação para o texto de exemplo do modelo, e siga para o Passo 6.
- **Sim:** registre `Bonificação ligada à meta: sim` e faça as perguntas abaixo, uma por vez:

```
Qual o percentual de comissão do vendedor enquanto ele ainda não bateu a meta? (ex: 3,5%)
```
```
E quando ele bate a primeira meta? (ex: 4%)
```
```
E quando bate a meta super, se houver? (ex: 4,2%. Se não existe meta super, responda "não tem")
```

Se a loja tem meta super, faça mais esta (se respondeu "não tem", grave `Meta super: não tem` e pule):

```
Como a meta super é definida?

1. É a meta mais um percentual (ex: meta + 15%)
2. É um valor que eu cadastro todo mês na aba Metas
```

Na opção 1, pergunte "Qual percentual acima da meta?" (ex: 15%) e grave `Meta super: +15%` com o número que a pessoa disse. Na opção 2, grave `Meta super: valor manual`.

```
Como a comissão é apurada ao longo do mês?

1. Por semanas
2. Pelos períodos cadastrados na aba Corridas (ex: 1º Período, 2º Período)
3. O mês inteiro de uma vez
```

Grave `Períodos de apuração: semanas`, `corridas` ou `mês`, conforme a resposta.

```
A loja tem regra de recuperação? Ela funciona assim: se o vendedor bate a meta do mês, os períodos que ficaram abaixo da meta passam a valer o percentual da meta.

1. Sim
2. Não
```

Grave `Regra de recuperação: sim` ou `nao`. Nunca presuma que a loja usa recuperação.

```
A faixa é definida pela meta de cada vendedor, e o percentual novo vale sobre todas as vendas dele naquele período?

1. Sim, é assim
2. Não, na minha loja é diferente
```

Grave cada percentual exatamente como a pessoa disse nas linhas `Comissão antes da meta`, `Comissão ao bater a meta` e `Comissão ao bater a super` (se não tem meta super, escreva "não tem" na terceira). Se a resposta da última pergunta for **1**, deixe as linhas `Faixa definida pela meta: individual` e `Percentual vale sobre: todas as vendas do período` como estão. Se for **2**, peça "Me conte como funciona, com as suas palavras", grave a explicação exatamente como foi dada no espaço de descrição do modelo, troque a linha `Faixa definida pela meta` por `Faixa definida pela meta: outra (ver descrição)`, e avise em uma frase que a calculadora de comissão ainda não entende essa regra e por isso não vai calcular até a Vetria atender esse modelo.

Depois de gravar, diga que a comissão de cada vendedor pode ser consultada pelo comando `/gerente-comissao`.

## Passo 6. Salvar

Escreva (ou atualize) `dna/indicadores/config-metas.md` com o modelo de `templates/config-metas.md`, preenchendo cada seção com o que a pessoa respondeu:
- Como a meta é definida hoje (Passo 1)
- Histórico de vendas fora do sistema (Passo 2)
- Dias fortes e dias fracos (Passo 3)
- Datas e ações que mexem nas vendas e particularidades da operação (Passo 4)
- Comissão ligada à meta: a linha `Bonificação ligada à meta: sim` ou `nao`, as três linhas de percentual, as linhas `Meta super`, `Períodos de apuração` e `Regra de recuperação`, as duas linhas da regra e a descrição, se houver (Passo 5)
- Última atualização: data de hoje, no formato DD/MM/AAAA, reescrita sempre que qualquer parte mudar

Copie as respostas como a pessoa deu, sem reescrever nem resumir. Em uma atualização, mantenha como está o que ela não mexeu. Campo que a pessoa pulou fica com o texto de exemplo do modelo, nunca preenchido por você.

Anexe uma linha nova ao final de `entregas/registro-atividades.md` a cada vez que salvar (o registro só cresce, não edite linhas antigas), seguindo o formato da seção "REGISTRO DE ATIVIDADES" do CLAUDE.md, com o título "Configuração de metas" na primeira vez e "Configuração de metas atualizada" nas seguintes. Use `Read` e `Edit`, nunca `Write` nesse arquivo.

## Passo 7. Confirmar

```
Configuração de metas salva.

Os pesos de cada dia do mês você ajusta na aba "Meta por dia" da Área Adm. Quando a Vetria passar a sugerir esses pesos sozinha, vai usar o que você me contou aqui.
```
