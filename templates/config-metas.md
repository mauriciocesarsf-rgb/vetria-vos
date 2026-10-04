# Configuração de metas

Preenchido por `/gerente-configurar-metas`. Guarda como esta loja pensa e define suas metas. A Vetria analisa, recomenda e acompanha; as regras comerciais são sempre da loja, nunca um padrão da Vetria.

## Como a meta é definida hoje

(quem define a meta do mês e como ela chega até a equipe, ex: "a franqueadora manda a meta do mês e eu divido por semana", "eu mesma defino olhando o ano passado")

## Histórico de vendas fora do sistema

(a loja tem vendas de meses ou anos anteriores guardadas em planilha ou outro lugar, que ainda não estão em `vendas.csv`? Descreva o período e onde estão. Sem histórico, escreva "nenhum")

## Dias fortes e dias fracos

(o que a equipe já sabe do ritmo da loja, ex: "sábado é o dia mais forte", "segunda é fraca", "semana do pagamento vende mais". É informação da loja, a Vetria não completa o que não for dito aqui)

## Datas e ações que mexem nas vendas

(datas comemorativas, ações e campanhas que costumam mudar o resultado, e se mudam pouco ou muito, ex: "Dia das Mães é o maior mês do ano", "Black costuma dobrar a última semana")

## Particularidades da operação

(qualquer outra coisa sobre a loja que mude como as metas devem ser pensadas, ex: "o shopping fecha mais cedo aos domingos", "loja nova, vendas ainda crescendo", "reforma prevista em novembro")

## Bonificação ou comissão ligada à meta

A regra de comissão da loja, usada por `/gerente-comissao`. Cada loja define a sua, nada aqui é padrão da Vetria. A calculadora entende uma regra só: três percentuais por vendedor, em cada período de apuração, com a faixa definida pela meta individual do vendedor e o percentual valendo sobre todas as vendas dele no período. A meta super, os períodos e a recuperação são configuráveis abaixo.

Bonificação ligada à meta: sim/nao

Comissão antes da meta: _
Comissão ao bater a meta: _
Comissão ao bater a super: _
Meta super: _
Períodos de apuração: _
Regra de recuperação: _
Faixa definida pela meta: individual
Percentual vale sobre: todas as vendas do período

(Meta super: "+15%" (a super é a meta mais 15%, ou outro percentual), "valor manual" (a super é um valor cadastrado todo mês na aba Metas) ou "não tem". Períodos de apuração: "semanas" (semanas do mês), "corridas" (os períodos cadastrados na aba Corridas) ou "mês" (o mês inteiro). Regra de recuperação: "sim" (se o vendedor bate a meta do mês, os períodos que ficaram abaixo da meta passam a valer o percentual da meta) ou "não")

(se a regra da loja for diferente desse modelo, ou tiver detalhes que os campos acima não cobrem, descreva aqui com as suas palavras. Nesse caso a calculadora não calcula e avisa)

## Última atualização

(data em que este arquivo foi preenchido ou revisado pela última vez)
