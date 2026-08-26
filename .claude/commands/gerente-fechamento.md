---
name: vetria:gerente-fechamento
description: Análise completa de fechamento (mensal ou semanal) — faturamento, melhores e piores dias com hipóteses, indicadores da loja e de cada vendedor, pontuação e recomendações — para apoiar reunião de desempenho com a equipe.
allowed-tools: Read, Write, Bash
model: sonnet
---

# Gerente IA. Fechamento de Período

Executa imediatamente: monta um documento de análise completa (não uma mensagem curta) para apoiar uma reunião de desempenho real com a equipe. Diferente de `/gerente-enviar-relatorio` (acompanhamento rápido, mensagem curta) e `/gerente-boas-vindas-mes` (meta + 1 sugestão por vendedor, início do mês) — este é o fechamento: o que aconteceu, por quê, e como melhorar.

Cadência sugerida: fechamento **mensal** todo dia 1 (ou assim que a planilha do mês anterior estiver completa) e alinhamento **semanal** toda segunda-feira, para não deixar tudo acumular pro fim do mês. Sem agendamento embutido — para rodar sozinho, use a skill `schedule`.

## Passo 1. Determinar o tipo e o período

```
Este fechamento é:

1. Mensal (mês anterior completo)
2. Semanal (semana anterior completa, segunda a domingo)

Digite o número, ou informe um período específico (DD/MM a DD/MM).
```

Se não especificado e o comando estiver rodando de forma agendada, infira pelo dia: dia 1 do mês → mensal (mês anterior inteiro); segunda-feira → semanal (semana anterior inteira).

## Passo 2. Ler os dados do período

Leia `minhas-empresas/.ativa`. Leia `vendas.csv`, `corridas.csv`, `premios-especiais.csv`, `meta-mensal-loja.csv` em `minhas-empresas/{ativa}/dna/indicadores/`. Leia também o período **anterior ao período anterior** (ex: se o fechamento é de agosto, leia julho também) para ter uma base de comparação.

**Mesmo período, ano anterior (sazonalidade — só entra em jogo com 1 ano+ de histórico).** Filtre `vendas.csv` também pelo mesmo período de 1 ano atrás (ex: fechamento de agosto/2026 → linhas de agosto/2025). **Se não houver nenhuma linha alcançando essa data, ignore este passo inteiro** — a comparação segue só com o período anterior, exatamente como já funciona hoje. Moda é sazonal — essa comparação, quando existir, costuma valer mais que período vs. período imediatamente anterior.

Se não houver linhas de `vendas.csv` no período: informe que não há dados suficientes para o fechamento e encerre.

Nunca invente números. Onde faltar dado para uma comparação (ex: não há período anterior ainda), diga isso explicitamente em vez de omitir ou inventar.

## Passo 3. Análise da loja

Calcule, somando todos os vendedores por dia:
- Faturamento total do período vs. meta do período (proporcional, a partir de `meta-mensal-loja.csv`) — valor e percentual de atingimento.
- Comparação com o período anterior equivalente (% de variação).
- PA, TM, PM e taxa de conversão médios do período, comparados ao período anterior.
- **Quando houver dado de 1 ano atrás (ver Passo 2):** a mesma comparação (faturamento, PA, TM, PM, conversão) também contra o mesmo período do ano anterior, lado a lado com a comparação de período anterior — nunca no lugar dela. Sem esse dado, omita, não invente.

**Melhores e piores dias:** ordene os dias do período por faturamento. Destaque os 3 melhores e os 3 piores (ou todos, se o período for semanal e tiver menos de 6 dias úteis). Para cada um, aponte uma hipótese de causa **baseada apenas em padrões observáveis nos próprios dados** (dia da semana, conversão daquele dia, PA daquele dia, se coincide com alguma corrida vigente). Nunca invente causas externas (feriado, clima, evento) que não estejam registradas em nenhum arquivo — se suspeitar de uma causa externa, diga que é uma hipótese não confirmada e pergunte ao usuário se procede.

## Passo 4. Análise por vendedor

Para cada vendedor com dados no período:
- Faturamento, PA, TM, PM, conversão do período, comparados à média do time e (se houver) ao período anterior dele mesmo.
- Classificação, reaproveitando o padrão já definido: ⭐ Destaque da Equipe / 🟡 Ponto de Atenção / 🔴 Prioridade.
- Um ponto forte específico (indicador + número).
- Um ponto de melhoria específico (indicador + número, nunca julgamento sobre a pessoa).
- Uma recomendação prática e acionável para o próximo período — não genérica.

## Passo 5. Montar o documento

Salve em `minhas-empresas/{ativa}/entregas/gestao/fechamento-{mensal-ou-semanal}-{periodo_inicio}-a-{periodo_fim}.md`, com esta estrutura:

```markdown
# Fechamento {Mensal/Semanal} — {NOME_EMPRESA}
Período: {DD/MM} a {DD/MM}

## Resumo Executivo
[faturamento total, % da meta, variação vs período anterior — 3 a 5 linhas, direto]

## Loja
### Faturamento e indicadores
[tabela ou lista: faturamento, PA, TM, PM, conversão — período atual vs anterior, mais uma coluna "vs. mesmo período ano anterior" quando esse dado existir (Passo 2) — omitida por inteiro sem esse dado, nunca preenchida com invenção]

### Melhores dias
[cada um: data, faturamento, hipótese]

### Dias de atenção
[cada um: data, faturamento, hipótese]

### O que fez a diferença
[síntese objetiva — padrões que se repetem, sem julgamento]

## Equipe
[para cada vendedor: classificação, indicadores, ponto forte, ponto de melhoria, recomendação — usar subtítulos por nome]

## Recomendações para o próximo período
[loja: 2 a 4 ações práticas]
[por vendedor: 1 recomendação cada, resumida numa lista final para consulta rápida na reunião]

---
*Gerado por Vetria · Gerente IA em {data de geração}. Use este documento como pauta da reunião de desempenho — não é para ser lido em voz alta, é para orientar a conversa.*
```

Informe ao usuário o caminho salvo. Nunca mostre o markdown bruto completo no chat — pode mostrar o Resumo Executivo como prévia.

## Passo 6. Oferecer aviso curto

```
Fechamento salvo em {caminho}.

Quer que eu mande um aviso curto pro seu canal (Telegram/WhatsApp) avisando que está pronto, com o resumo executivo?

1. Sim
2. Não
```

Se sim: monte um resumo curto (resumo executivo + destaque de 1 vendedor positivo, sem citar quem está em ponto de atenção — isso é sensível demais para uma notificação curta, fica só no documento completo). Esse aviso é conteúdo de fechamento/início de mês, então vai ilustrado: siga o Passo 2d de `.claude/skills/gerar-imagem/SKILL.md`, salvando em `entregas/gestao/apresentacoes/fechamento-resumo-{periodo_inicio}-a-{periodo_fim}.png` (sem `VETRIA_EXE_PATH` disponível, siga só com o texto). Envie para o **destino do gerente** (mesma lógica de `/gerente-boas-vindas-mes`, nunca o grupo — este conteúdo é avaliação de equipe, não é para o grupo geral), com a imagem quando existir e o resumo curto como legenda, no mesmo formato de `curl`/Node de `/gerente-enviar-relatorio` Passo 6. Confirme antes de enviar, como sempre.

## Regras

Nunca inclua julgamento negativo sobre ninguém, em nenhuma seção. "Ponto de atenção" descreve o indicador, nunca a pessoa. Recomendações são sempre específicas e acionáveis, nunca genéricas ("se esforce mais", "vender mais"). Registre em `minhas-empresas/{ativa}/memoria/gerente-ia.md` que o fechamento deste período foi gerado.
