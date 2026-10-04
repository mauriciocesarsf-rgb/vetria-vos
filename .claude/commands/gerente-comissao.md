---
name: vetria:gerente-comissao
description: Calcula a comissão de cada vendedor no mês, período a período, com a regra cadastrada na configuração de metas (percentual antes da meta, ao bater a meta e ao bater a super). Só para o gestor.
allowed-tools: Read, Bash
model: sonnet
---

# Comissão por vendedor

Mostra ao gestor quanto cada vendedor já tem de comissão, quanto teria se o período fechasse hoje e uma projeção para o fim, com a regra que a própria loja cadastrou. É uma calculadora: nunca invente percentual, meta ou regra que a loja não informou, e nunca ajuste um valor por conta própria.

**Só o gestor vê isso.** Nunca mande valores de comissão para o grupo da equipe nem monte versões para os vendedores. Se pedirem, explique que essa conta fica só com o gestor.

## Passo 0. Definir o mês

Se o pedido trouxe um mês no formato AAAA-MM, use esse. Sem mês, use o mês corrente.

Leia `minhas-empresas/.ativa` para saber a empresa.

## Passo 1. Calcular

Rode, trocando AAAA-MM pelo mês escolhido:

```bash
node .claude/skills/gerente-metas/calcular-comissao.js AAAA-MM
```

A conta é feita inteira por esse programa: não recalcule, não arredonde e não ajuste nenhum valor por conta própria. O resultado vem em formato de dados, com um campo `status`:

- **`nao_configurada`:** a loja ainda não informou a regra de comissão (ou disse que não tem). Explique e ofereça rodar `/gerente-configurar-metas`.
- **`sem_percentual`:** faltam os percentuais na configuração. Diga quais e ofereça `/gerente-configurar-metas`.
- **`regra_nao_suportada`:** a regra cadastrada é diferente da que a calculadora entende. Diga isso com clareza, repita o que foi cadastrado e explique que ainda não dá para calcular essa regra.
- **`sem_meta`, `sem_vendedores` ou `sem_vendas`:** diga o que falta (meta do mês, vendedores ativos ou vendas lançadas) e onde cadastrar (Área Adm).
- **`erro`:** conte em uma frase o que a mensagem diz, sem mostrar o formato técnico.
- **`ok`:** siga para o Passo 2.

## Passo 2. Contar o resultado

Em português simples, sem mostrar números em formato de dados. Estrutura:

1. **Quando e como foi calculado:** a data de referência (a venda mais recente lançada) e a regra: "3,5% até bater a meta, 4% ao bater, 4,2% ao bater a super" (use os percentuais que vieram), com a faixa definida pela meta de cada vendedor em cada período. Diga também, em uma frase, como a meta super é definida (ex: "meta mais 15%"), como os períodos são apurados (semanas, períodos cadastrados em Corridas ou o mês inteiro) e se a regra de recuperação está ligada.
2. **Para cada período do mês**, na ordem, uma linha de cabeçalho com o nome e as datas e o andamento (encerrado, em andamento ou ainda não começou). Para períodos que já começaram, uma linha por vendedor que vendeu, com: quanto vendeu, a meta dele no período, a faixa em que está (antes da meta, na meta, na super) com o percentual, e a comissão. Em período encerrado, chame de "comissão final"; em período em andamento, de "comissão se fechasse hoje", e acrescente a projeção de fim de período e a comissão projetada. Se faltar pouco para a próxima faixa, diga quanto falta. Vendedores que não venderam nada no período vão agrupados numa linha só ("Sem vendas no período: ..."), sem uma linha para cada. Períodos que ainda não começaram: só cite que ainda não começaram.
3. **Total do mês por vendedor:** comissão acumulada até hoje e comissão projetada, e o total da loja. Com a regra de recuperação ligada: para o vendedor que já bateu a meta do mês, diga quais períodos foram recalculados para o percentual da meta e quanto isso acrescentou; para quem ainda não bateu, diga que a recuperação só vale se ele bater a meta do mês, quanto falta para isso, e se a projeção indica que ele chega lá. Nunca aplique recuperação por conta própria: use só o que a calculadora trouxe.
4. **Avisos**, só os que se aplicam: vendas de quem não está no cadastro (como o e-commerce) ficaram de fora; vendas fora dos períodos cadastrados não rendem comissão (cite o valor, se houver).
5. **Premissas, em poucas frases e sem jargão:** a meta super de cada vendedor foi calculada na mesma proporção da super da loja sobre a cota, e deve ser conferida; a projeção é uma estimativa que supõe que o resto do período siga o ritmo esperado e só vale para o período em andamento (períodos que ainda não começaram não entram nela); o percentual da faixa vale sobre todas as vendas do vendedor no período, e a meta de cada um é a maior entre a da corrida e a pessoal proporcional.
6. Feche pedindo para a pessoa conferir e dizendo: "Se a regra da loja for diferente de alguma dessas premissas, me avise antes de usar esses valores para pagar alguém."

Nunca use as palavras arquivo, programa, dados, csv ou formato técnico com a pessoa. Valores sempre em reais, com duas casas decimais e separador de milhar.
