---
name: vetria:gerente-acompanhamento
description: Mostra como a loja está na meta do mês, do período atual e do dia, e qual ritmo é necessário daqui pra frente considerando os dias que faltam e o peso de cada um.
allowed-tools: Read, Bash
model: sonnet
---

# Acompanhamento da meta

Mostra, de forma simples, onde a loja está na meta do mês, do período atual e do dia, e transforma o que falta em um ritmo que dê para perseguir. Nunca invente número: tudo vem da conta feita pelo programa abaixo.

## Passo 0. Definir a data

Se o pedido trouxe uma data no formato AAAA-MM-DD, use essa. Sem data, use hoje (o programa já assume hoje, no fuso de São Paulo).

Leia `minhas-empresas/.ativa` para saber a empresa.

## Passo 1. Calcular

```bash
node .claude/skills/gerente-metas/acompanhamento.js
```

(Com data: acrescente a data, ex: `node .claude/skills/gerente-metas/acompanhamento.js 2026-10-14`.) Não recalcule nem arredonde nada por conta própria. O resultado vem em formato de dados, com um campo `status`:

- **`sem_meta`:** diga que não há meta cadastrada para o mês e onde cadastrar (Área Adm, aba Metas).
- **`erro`:** conte em uma frase o que a mensagem diz, sem mostrar o formato técnico.
- **`ok`:** siga para o Passo 2.

## Passo 2. Contar o resultado

Em português simples, valores em reais com duas casas e separador de milhar. Estrutura:

1. **Mês:** meta, realizado, percentual atingido e o que falta. Se já bateu, diga isso (e não fale em "faltam").
2. **Período atual** (nome e datas): meta do período, realizado, percentual e o que falta.
3. **Hoje:** meta do dia, quanto já vendeu e o que falta. Se `loja_aberta` for falso, diga que hoje a loja não abre e que a meta do dia é zero.
4. **Ritmo necessário:** transforme o que falta em algo acionável. Use `necessario_hoje_considerando_os_pesos` e o número de dias de funcionamento que restam: "Considerando os {N} dias de funcionamento que restam e o peso de cada um, hoje a loja precisa vender cerca de R$ X para ficar no caminho da meta do mês." Se o número do período for diferente, cite também o do período. Compare com `necessario_por_dia_em_media` só quando houver diferença relevante (ex: hoje pesa menos que a média por ser um dia fraco). Se a meta do mês ou do período já foi batida, não fale em ritmo.
5. **Vendedores:** uma linha por vendedor com o percentual da meta do mês e do período e o que falta, destacando quem está no caminho e quem precisa de atenção, sem tom de cobrança.
6. **Fecho curto:** se os pesos aprovados do mês estão em uso ou se o cálculo está com dias iguais (campo `usa_pesos_aprovados`), e que isso muda o ritmo de cada dia.

Nunca use as palavras arquivo, programa, dados, csv ou formato técnico com a pessoa. Sem julgamento negativo sobre nenhum vendedor.
