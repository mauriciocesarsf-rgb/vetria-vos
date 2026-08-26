---
name: vetria:gerente-dia-fraco
description: Monta um playbook de ativação para dias de baixo fluxo — scripts de contato ativo pra equipe usar na própria carteira de clientes, mais briefings prontos para o Vetria Marketing e o Vetria Stylist produzirem conteúdo rápido.
allowed-tools: Read, Write
model: sonnet
---

# Gerente IA. Dia de Baixo Fluxo

Executa imediatamente: monta um plano de ativação para manter a equipe vendendo em vez de esperando cliente entrar. Não substitui `/gerente-enviar-relatorio` nem `/gerente-fechamento` — é focado em ação imediata pro dia de hoje.

## Passo 1. Confirmar que é um dia de baixo fluxo

Leia `minhas-empresas/.ativa`. Leia `minhas-empresas/{ativa}/dna/indicadores/vendas.csv`.

Se o usuário já disse que hoje está fraco, confirme o dia e prossiga. Senão, calcule: compare `clientes_atendidos` de hoje (ou do dia mais recente com dados) com a média do mesmo dia da semana nas últimas semanas. Informe a comparação (ex: "hoje teve 8 clientes atendidos até agora; a média de quintas-feiras é 22") e pergunte se o usuário quer seguir com o plano de ativação.

Se não houver dados suficientes pra comparar (histórico curto), pergunte diretamente se é um dia fraco.

## Passo 2. Levantar contexto

Leia o Workbook DNA da empresa ativa (`dna/workbook-dna.docx`) para tom de comunicação, produtos em destaque e diferenciais. Leia `corridas.csv` e `premios-especiais.csv` vigentes — se houver uma corrida rodando, o playbook de hoje pode reforçá-la (ex: "hoje é um bom dia pra puxar P.A., já que está devagar").

Identifique os vendedores ativos: leia `dna/indicadores/vendedores.json` e filtre `ativo=true` (ao casar com `vendas.csv`, confira também `nomesAnteriores`). Se o arquivo não existir ou estiver vazio, pergunte ao usuário — nunca invente.

## Passo 3. Montar o Playbook de Ativação

```markdown
# Playbook de Ativação — {data}
{NOME_EMPRESA}. Fluxo abaixo do esperado hoje — hora de agir, não esperar.

## Contato ativo (cada vendedor usa a própria carteira)
Separe de 5 a 10 clientes que você já atendeu antes. Mande mensagem pessoal, uma de cada vez — nunca uma mensagem em massa idêntica pra todo mundo.

**Reativação** (cliente sumido)
"{modelo de mensagem, tom adaptado ao Workbook DNA}"

**Novidade / coleção nova**
"{modelo}"

**Complemento da compra anterior** (respeitando o segmento — nunca sugerir o que a loja já vende no mesmo tipo de produto)
"{modelo}"

**Convite direto pra loja hoje**
"{modelo, com motivo específico do dia, não genérico}"

## Para produzir agora, se fizer sentido
- **Vetria Marketing**: {briefing — objetivo, produtos em destaque, urgência, tom}
- **Vetria Stylist**: {briefing — vitrine ou look de destaque, produtos disponíveis, urgência}
```

Adapte os modelos de mensagem ao tom de comunicação real da empresa — nunca deixe genérico se o Workbook DNA já define um tom específico.

## Passo 4. Entregar

Mostre o playbook completo no chat (é curto o suficiente para isso, diferente do fechamento mensal). Pergunte:

```
Quer que eu já monte o conteúdo com o Vetria Marketing ou o Vetria Stylist agora, usando esse briefing?

1. Vetria Marketing
2. Vetria Stylist
3. Os dois
4. Não, só o playbook por enquanto
```

Se 1, 2 ou 3: informe que o usuário pode mudar para aquele especialista agora e colar o briefing correspondente — a Vetria já leva o contexto, sem precisar reexplicar do zero. Salve também o playbook em `minhas-empresas/{ativa}/entregas/gestao/dia-fraco-{data}.md` para referência.

## Regras

Nunca sugira contato agressivo ou insistente com o cliente. Nunca finja ter uma lista de clientes específicos — os modelos são para o vendedor aplicar na própria carteira. Nunca use dado que não existe no sistema.
