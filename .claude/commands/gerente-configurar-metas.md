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

## Passo 5. Bonificação ligada à meta

```
A equipe tem bonificação ou comissão ligada à meta?

1. Sim
2. Não
```

- **Não:** registre `Bonificação ligada à meta: nao` e apague qualquer explicação que existisse antes (volta o texto de exemplo do modelo). Nesse caso não precisa do aviso abaixo.
- **Sim:** registre `Bonificação ligada à meta: sim` e pergunte "Como ela funciona? Pode explicar com as suas palavras" (ex: percentual fixo sobre o total, faixas por percentual da meta, valor extra para a meta super). Salve a explicação exatamente como foi dada, sem reescrever regra nem converter em fórmula.

Avise em uma frase (só quando a resposta for Sim) que a Vetria ainda não calcula bonificação: por enquanto isso só fica guardado, para quando esse recurso existir.

## Passo 6. Salvar

Escreva (ou atualize) `dna/indicadores/config-metas.md` com o modelo de `templates/config-metas.md`, preenchendo cada seção com o que a pessoa respondeu:
- Como a meta é definida hoje (Passo 1)
- Histórico de vendas fora do sistema (Passo 2)
- Dias fortes e dias fracos (Passo 3)
- Datas e ações que mexem nas vendas (Passo 4)
- Bonificação ligada à meta, com a linha `Bonificação ligada à meta: sim` ou `nao` e a descrição, se houver (Passo 5)
- Última atualização: data de hoje, no formato DD/MM/AAAA, reescrita sempre que qualquer parte mudar

Copie as respostas como a pessoa deu, sem reescrever nem resumir. Em uma atualização, mantenha como está o que ela não mexeu. Campo que a pessoa pulou fica com o texto de exemplo do modelo, nunca preenchido por você.

Anexe uma linha nova ao final de `entregas/registro-atividades.md` a cada vez que salvar (o registro só cresce, não edite linhas antigas), seguindo o formato da seção "REGISTRO DE ATIVIDADES" do CLAUDE.md, com o título "Configuração de metas" na primeira vez e "Configuração de metas atualizada" nas seguintes. Use `Read` e `Edit`, nunca `Write` nesse arquivo.

## Passo 7. Confirmar

```
Configuração de metas salva.

Os pesos de cada dia do mês você ajusta na aba "Meta por dia" da Área Adm. Quando a Vetria passar a sugerir esses pesos sozinha, vai usar o que você me contou aqui.
```
