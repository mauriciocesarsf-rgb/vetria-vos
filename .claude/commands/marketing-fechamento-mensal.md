---
name: vetria:marketing-fechamento-mensal
description: Fechamento mensal de conteúdo — o que funcionou, o que não funcionou, e o que repetir no próximo mês, a partir do calendário do mês e da avaliação do usuário (o sistema não tem acesso a métricas do Instagram/TikTok).
allowed-tools: Read, Write
model: sonnet
---

# Vetria Marketing. Fechamento Mensal

Executa imediatamente: monta o relatório de fechamento do mês de conteúdo. Pensado para rodar no último dia do mês — agende com a skill `schedule` se quiser automático.

## Passo 1. Ler o calendário do mês

Leia `minhas-empresas/.ativa`. Leia `minhas-empresas/{ativa}/dna/marketing/calendario-{AAAA-MM do mês que está fechando}.md`.

Se não existir: informe que não há calendário registrado para esse mês, e pergunte se quer montar o fechamento só com o que o usuário lembrar, sem o calendário como referência.

## Passo 2. Perguntar o que funcionou

**Limitação importante:** o sistema não tem acesso direto a métricas do Instagram/TikTok (visualizações, curtidas, alcance, vendas atribuídas). Nunca invente esses números.

```
Olhando o calendário deste mês, quais temas/conteúdos tiveram bom resultado (visualizações, engajamento, ou venda que você percebeu)?

E quais não performaram como esperado?

Pode listar livremente, ou me passar números se tiver à mão.
```

Aguarde a resposta antes de montar o relatório.

## Passo 3. Montar o relatório

```markdown
# Fechamento de Conteúdo — {NOME_EMPRESA} — {Mês/Ano}

## O que funcionou
[com base na resposta do usuário, cruzada com o calendário: quais temas/formatos]

## O que não funcionou
[idem]

## Padrões identificados
[ex: formatos que se repetem entre os que funcionaram, temas que não engajam nesta empresa]

## Recomendações para o próximo mês
- Repetir: [temas/formatos validados]
- Ajustar: [o que mudar]
- Testar: [2-3 ideias novas para o próximo calendário]
```

Salve em `minhas-empresas/{ativa}/entregas/marketing/fechamento-{AAAA-MM}.md`. Mostre o resumo (seções "O que funcionou" e "Recomendações") no chat, sem o documento inteiro.

## Regras

Nunca invente métrica que o usuário não informou. Se a resposta do Passo 2 for vaga, trabalhe com o que foi dado em vez de forçar números precisos.
