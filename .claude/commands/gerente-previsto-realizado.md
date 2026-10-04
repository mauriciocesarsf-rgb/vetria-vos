---
name: vetria:gerente-previsto-realizado
description: Compara o previsto (pesos dos dias) com o que a loja realmente vendeu no mês, e a sugestão original da Vetria com o que o gestor aprovou, para a Vetria aprender e recomendar melhorias. Só recomenda, nunca altera regras.
allowed-tools: Read, Bash
model: sonnet
---

# Previsto x realizado

Mostra ao gestor como o mês aconteceu em relação ao que estava previsto, e se a sugestão original da Vetria ou a versão que ele aprovou chegou mais perto da realidade. Serve para a Vetria melhorar as próximas recomendações. **Isso só recomenda: nunca altere nenhuma regra, peso ou meta da loja por conta própria, e nunca apresente uma recomendação como decisão tomada.**

## Passo 0. Definir o mês

Se o pedido trouxe um mês no formato AAAA-MM, use esse. Sem mês, use o mês anterior ao corrente (é o que costuma ser revisado depois de fechar).

Leia `minhas-empresas/.ativa` para saber a empresa.

## Passo 1. Calcular

```bash
node .claude/skills/gerente-metas/previsto-realizado.js AAAA-MM
```

Se o mês escolhido já terminou (é anterior ao mês corrente), acrescente `--registrar` ao final: isso guarda o resultado do mês no histórico da loja, uma linha por mês, que é a base para a Vetria comparar vários meses depois. Para o mês em andamento, não use `--registrar`.

Não recalcule nada por conta própria. O resultado vem em formato de dados, com um campo `status`:

- **`sem_meta`:** diga que não há meta cadastrada para o mês e onde cadastrar (Área Adm, aba Metas).
- **`sem_vendas`:** diga que ainda não há vendas lançadas no mês.
- **`erro`:** conte em uma frase o que a mensagem diz, sem mostrar o formato técnico.
- **`ok`:** siga para o Passo 2.

## Passo 2. Contar o resultado

Em português simples, valores em reais com duas casas e separador de milhar, porcentagens com no máximo duas casas. Estrutura:

1. **O mês:** meta, realizado e atingimento. Diga até que data foi comparado, e se o mês está completo ou em andamento. Diga também com o que o previsto foi montado (pesos aprovados, ou dias iguais por falta de aprovação).
2. **Por período:** para cada período, o atingimento da meta do período; destaque o melhor e o pior.
3. **Por dia da semana:** onde o realizado ficou bem acima ou bem abaixo do previsto (use `por_dia_da_semana` e as observações que vieram).
4. **Os dias que mais fugiram do previsto:** cite até três (data, previsto, realizado), sem especular a causa: se o gestor tiver uma explicação (ação, feriado, falta de equipe), é dele.
5. **A sugestão contra o aprovado:** se houver sugestão original guardada, diga quais dias o gestor mudou e quanto, e qual versão (sugerida ou aprovada) chegou mais perto do realizado, com os dois erros médios. Sem sugestão guardada, diga isso em uma frase.
6. **O que a Vetria recomenda aprender com isso:** de uma a três recomendações sobre os **pesos e os dias** (por exemplo, dar mais ou menos peso a um período ou dia da semana), só quando o que veio dos números sustentar. Não tire conclusões sobre a meta em si (se está alta ou baixa) nem sobre pessoas: isso é decisão do gestor. Escreva como sugestão ("vale considerar...", "se isso se repetir nos próximos meses..."). Com um mês só de comparação, deixe claro que ainda é pouco para concluir. Termine dizendo que nada foi alterado e que a decisão é do gestor.

Nunca use as palavras arquivo, programa, dados, csv ou formato técnico com a pessoa. Sem julgamento negativo sobre nenhum vendedor.
