---
name: vetria:gerente-sugerir-metas
description: Sugere como dividir a meta do mês entre os dias, a partir do histórico de vendas, e deixa como rascunho para o gestor revisar e aprovar na aba Meta por dia da Área Adm.
allowed-tools: Read, Edit, Bash
model: sonnet
---

# Sugerir metas por dia

Monta uma sugestão de quanto cada dia pesa na meta do mês, olhando como a loja vendeu em meses anteriores. É sempre só uma sugestão: nada vale até o gestor aprovar na aba "Meta por dia" da Área Adm. Nunca aprove nem ajuste os pesos por conta própria, e nunca invente um padrão que o histórico não mostra.

## Passo 0. Definir o mês

Se o pedido trouxe um mês no formato AAAA-MM, use esse. Sem mês explícito, use o mês seguinte ao mês corrente. Se estiver conversando com alguém, confirme o mês em uma frase antes de continuar.

Leia `minhas-empresas/.ativa` para saber a empresa.

## Passo 1. Gerar a sugestão

Rode, trocando AAAA-MM pelo mês escolhido:

```bash
node .claude/skills/gerente-metas/sugerir-pesos.js AAAA-MM
```

Só acrescente `--refazer` ao final se a pessoa pediu claramente para substituir pesos já aprovados daquele mês. A conta é feita inteira por esse programa: não recalcule, não ajuste e não arredonde nenhum peso por conta própria.

O resultado vem em formato de dados, com um campo `status`:

- **`erro`:** conte em uma frase o que a mensagem diz, sem mostrar o formato técnico. Não tente consertar por outro caminho.
- **`ja_aprovado`:** o mês já tem pesos aprovados e nada foi alterado. Avise isso, explique que uma nova sugestão troca os pesos atuais por um rascunho (e os relatórios voltam a usar dias iguais até a pessoa aprovar de novo) e pergunte se quer mesmo substituir. Só rode de novo com `--refazer` se a resposta for sim.
- **`ok`:** siga para o Passo 2.

## Passo 2. Contar o resultado

Leia o arquivo indicado em `arquivo_explicacao` e resuma em 3 a 5 frases curtas (a frase final com o aviso de rascunho conta à parte), em português simples:
- No que a sugestão se baseou: quantos meses de histórico (ou que ainda não há histórico suficiente e os dias ficaram iguais).
- Os dias da semana que mais e menos pesam, quando houver padrão medido, com a porcentagem.
- O aviso de que histórico curto é uma indicação fraca, quando a explicação trouxer.
- Se a explicação trouxer o trecho "Você me contou", diga em uma frase se os números confirmam ou divergem do que a pessoa disse sobre os dias fortes e fracos.
- O que ainda não foi considerado (feriados em que a loja fecha, datas comemorativas e ações) e que isso se ajusta na tela.

Termine dizendo que é um rascunho e onde revisar: "Abra a aba Meta por dia na Área Adm, ajuste o que quiser e aprove."

Nunca use as palavras arquivo, programa, dados, csv ou formato técnico com a pessoa.

## Passo 3. Registrar

Anexe uma linha nova ao final de `entregas/registro-atividades.md`, seguindo o formato da seção "REGISTRO DE ATIVIDADES" do CLAUDE.md, com a data de hoje, o especialista "Gerente IA", o título "Sugestão de pesos da meta de {mês por extenso}/{ano}", o link para `dna/indicadores/pesos-{AAAA-MM}-explicacao.md` e status **pendente validação**. Use `Read` e `Edit`, nunca `Write` nesse arquivo.
