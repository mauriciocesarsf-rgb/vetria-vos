---
name: vetria:gerente-configurar-escala
description: Coleta horário de funcionamento, tipo de escala desejada, dias sem folga e regras trabalhistas locais para alimentar a sugestão mensal de escala (/gerente-sugerir-escala).
allowed-tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

# Configurar escala

Coleta o que o Gerente IA precisa saber pra sugerir a escala mensal de folgas da equipe. Roda uma vez, e de novo sempre que algo mudar (horário da loja, convenção coletiva renovada, etc.).

## Passo 0. Conferir se há vendedores lançados

Leia `minhas-empresas/.ativa` e `dna/indicadores/vendas.csv`. Extraia os nomes distintos de vendedor com lançamento no mês corrente ou no anterior. Sem nenhum nome: avise que a sugestão de escala precisa de pelo menos um vendedor com histórico em `vendas.csv` pra funcionar, e pergunte se quer continuar mesmo assim (fica salvo pra quando houver dado) ou parar por aqui.

## Passo 1. Horário de funcionamento

```
Qual o horário de funcionamento da loja? (dias da semana e horário de abertura/fechamento — pode variar por dia, ex: "seg a sáb 9h-19h, dom 12h-18h")
```

**Achado real, 2026-09-04:** além da descrição livre acima, pergunte também o horário padrão exato de abertura e fechamento (o que vale na maioria dos dias), em formato de hora simples:

```
E qual o horário padrão de abrir e fechar, só pra eu usar como referência (ex: "abre 9h, fecha 20h")? Uso isso pra mandar um lembrete pra equipe pouco antes de abrir e pouco antes de fechar.
```

Converta a resposta pra HH:mm (24h) antes de salvar (ex: "9h" → "09:00", "20h" → "20:00"). Se a pessoa não souber ou preferir pular, tudo bem — sem isso, os lembretes automáticos de abertura/fechamento simplesmente não são configurados, sem quebrar nada.

## Passo 2. Tipo de escala desejada

```
Que tipo de escala vocês querem?

1. 6x1 com folga fixa (cada vendedor folga sempre no mesmo dia da semana)
2. 6x1 com rodízio de fim de semana (folga muda toda semana, pra ninguém pegar sempre o mesmo sábado/domingo)
3. Outro modelo — descreva com suas palavras
```

A escala é sempre uma grade de datas específicas por mês (`escala-{AAAA-MM}.csv`), então tanto a opção 1 quanto a 2 são suportadas pela sugestão automática (`/gerente-sugerir-escala`) — a diferença é só a preferência de continuidade: com folga fixa, ela tenta manter cada vendedor sempre no mesmo dia da semana; com rodízio de fim de semana, ela varia o dia propositalmente pra ninguém pegar sempre o mesmo sábado/domingo. Registre a escolha, é usada como preferência pela sugestão, nunca como regra rígida.

## Passo 3. Dias que nunca podem ter folga

```
Tem algum dia (ou data) em que a loja nunca pode ficar sem cobertura suficiente — tipo sábado, véspera de feriado, datas de campanha? Pode listar mais de um, ou dizer "nenhum".
```

## Passo 4. Regras trabalhistas / convenção coletiva

Leia `dna/workbook-dna.docx`, seção "1. Dados básicos" → **Endereço completo**, pra identificar cidade/estado da loja. Se não houver endereço preenchido, pergunte direto: "em que cidade/estado fica a loja?" (precisa disso pra saber qual convenção coletiva vale).

Com a cidade/estado em mãos:

```
Pra respeitar a lei e o acordo coletivo do comércio na sua região, preciso saber as regras aplicáveis (folga semanal, trabalho aos domingos/feriados, etc.). Como prefere?

1. Eu pesquiso a convenção coletiva do comércio varejista de {cidade}/{estado} vigente e uso como base — sempre te mostrando a fonte antes de aplicar
2. Você me passa o texto ou link do acordo sindical/convenção coletiva que a loja segue
```

**Se opção 1:** use WebSearch (`convenção coletiva comerciários {cidade} {estado} {ano corrente} escala folga descanso semanal`, e se preciso uma segunda busca mais específica por sindicato patronal/laboral local — ex: Fecomércio + sindicato dos comerciários da região). Resuma em poucas frases as regras relevantes pra escala (dia de descanso semanal remunerado — DSR, regra pra domingo/feriado, compensação de horário), cite a fonte (nome do documento/site) e a data em que a vigência foi verificada. Mostre esse resumo ao usuário e pergunte se pode usar como base antes de salvar — **nunca aplique uma convenção pesquisada sem essa confirmação**, pesquisa automática pode estar desatualizada ou pegar o acordo errado (ex: convenção específica de supermercado não vale pra loja de vestuário/calçados — confira se o resultado é do setor certo antes de usar). Deixe explícito no resumo que isso é um ponto de partida, não substitui orientação de contador/RH.

**Se opção 2:** peça o texto ou o link, e use exatamente o que foi passado, sem pesquisar por conta própria.

## Passo 5. Salvar

Escreva (ou atualize) `dna/indicadores/config-escala.md` com o template de `templates/config-escala.md`, preenchendo:
- Horário de funcionamento (Passo 1)
- Horário padrão de abertura e fechamento, em HH:mm (Passo 1) — deixe em branco (`HH:mm`, sem preencher) se a pessoa pulou essa parte, nunca invente um horário
- Tipo de escala desejada (Passo 2, incluindo a ressalva sobre rodízio se for o caso)
- Dias que nunca podem ter folga (Passo 3)
- Regras trabalhistas / convenção coletiva aplicável, com fonte e data (Passo 4)
- Última atualização: data de hoje

## Passo 6. Confirmar

```
Configuração de escala salva. A partir de agora, todo último dia do mês* o Gerente IA monta a sugestão de escala do mês seguinte e manda pro seu canal configurado pra aprovação — sem precisar pedir nada.

Quer que eu já gere a sugestão deste mês agora, pra você ver como fica? (rode /gerente-sugerir-escala a qualquer momento pra isso)
```

(*a data exata de envio automático depende do agendamento no backend — se estiver rodando localmente sem o backend, a sugestão só sai quando alguém rodar `/gerente-sugerir-escala` manualmente.)
