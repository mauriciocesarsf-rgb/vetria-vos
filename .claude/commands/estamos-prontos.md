---
name: vetria:estamos-prontos
description: Largada oficial da empresa — confere se a Pasta DNA está completa (oferecendo completar antes ou depois) e monta, com a visão dos três especialistas juntos, um plano de ação até o fim do período atual a partir dos dados que já existem.
allowed-tools: Read, Write, Glob
model: sonnet
---

# Estamos prontos

Comando de largada: em vez de cada especialista começar do zero, os três juntos olham pra empresa ativa e devolvem um plano prático do que dá pra fazer dali até o fim do mês (ou da corrida vigente, se fizer mais sentido).

## Passo 1. Empresa ativa

Leia `minhas-empresas/.ativa`. Sem empresa ativa, informe e pare.

## Passo 2. Conferir a Pasta DNA

Leia `minhas-empresas/{ativa}/dna/workbook-dna.docx`. Confira as 13 seções (mesma lógica do painel: uma seção conta como preenchida se tiver conteúdo além do título).

**Se estiver 13/13:** siga direto pro Passo 3.

**Se faltar algo:** liste o que falta e pergunte:

```
Ainda falta preencher: {lista das seções vazias}.

Quer completar agora antes da largada, ou seguir com o que já temos e completar depois?

1. Completar agora
2. Seguir com o que já tem — completo depois
```

- **Opção 1:** conduza o preenchimento das seções faltantes (mesmo fluxo de ativação normal — pergunte, nunca invente), atualize `workbook-dna.docx`, depois siga pro Passo 3.
- **Opção 2:** siga pro Passo 3 mesmo assim. No plano final, sinalize com clareza quais recomendações ficaram mais genéricas por falta daquela informação (ex: sem "Público principal" preenchido, uma sugestão de conteúdo não pode ser tão direcionada).

## Passo 3. Ler a situação atual

- `dna/indicadores/vendas.csv`, `corridas.csv`, `meta-mensal-loja.csv` — soma do período atual, % da meta, corridas vigentes (mesmo cálculo do Passo 0.6 do Gerente IA).
- `dna/marketing/calendario-{AAAA-MM}.md`, se existir — o que já está planejado pro mês.
- Data de hoje vs. fim do mês corrente — quantos dias úteis restam.

Se `vendas.csv` não tiver nenhum lançamento ainda, não invente um diagnóstico — trate isso como ponto zero (empresa recém-ativada) e foque o plano em colocar o hábito de lançar os dados em dia, não em corrigir uma tendência que ainda não existe.

## Passo 4. Montar o plano conjunto

Um documento só, com a visão dos três especialistas, nessa ordem:

```
# Plano de Largada — {nome da empresa}
{data de hoje} · faltam {N} dias até o fim de {mês}

## Gestão (Gerente IA)
{diagnóstico rápido: meta do mês, % já atingido ou "ainda sem lançamentos", corridas vigentes}
{2-3 ações prioritárias pros dias restantes, concretas — não genéricas tipo "vender mais"}

## Marketing (Vetria Marketing)
{se já existe calendário do mês: o que está previsto pros próximos dias}
{se não existe: sugestão de rodar /marketing-criar-calendario, com 1-2 ideias imediatas pra não esperar o calendário pronto}

## Styling (Vetria Stylist)
{1-2 sugestões práticas considerando produtos/identidade visual disponíveis: vitrine, prancha pro vendedor, etc.}
{se não houver produtos/fotos na Pasta DNA ainda, diga isso claramente em vez de inventar}

## Próximos passos
{lista curta e priorizada, misturando as três áreas, do que fazer primeiro}
```

Nunca invente números, produtos ou tendências que não estejam nos arquivos da empresa — o que faltar, declare como pendente em vez de preencher com genérico.

## Passo 5. Salvar e registrar

Salve em `minhas-empresas/{ativa}/entregas/gestao/plano-de-largada-{AAAA-MM-DD}.md`.

Registre em `minhas-empresas/{ativa}/entregas/registro-atividades.md` (ver seção "REGISTRO DE ATIVIDADES" do `CLAUDE.md`) uma entrada com os três especialistas, status `pendente validação`.

## Passo 6. Entregar

Informe o caminho do arquivo e pergunte se a pessoa quer que algum dos especialistas já comece a executar algo do plano agora mesmo.
