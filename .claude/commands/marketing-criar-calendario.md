---
name: vetria:marketing-criar-calendario
description: Cria o calendário editorial do mês — datas comemorativas, campanhas da franqueadora e oportunidades de tendência — com sugestão de formato e conteúdo por dia.
allowed-tools: Read, Write, WebSearch
model: sonnet
---

# Vetria Marketing. Criar Calendário do Mês

Executa imediatamente: monta o calendário editorial do mês corrente (ou do mês informado). Pensado para rodar no dia 1 de cada mês — agende com a skill `schedule` se quiser automático.

## Passo 1. Contexto

Leia `minhas-empresas/.ativa`. Leia `dna/workbook-dna.docx` (posicionamento, tom de comunicação, público, produtos) e `dna/identidade-visual/` (materiais da franqueadora, se houver).

Verifique se `dna/marketing/estrategia-midias-sociais.md` existe — é o piso de ritmo semanal (mínimo de Stories/dia, Feed/Reels por semana) usado no Passo 4. Se não existir, gere agora seguindo o mesmo fluxo do Passo 0.6 do seu agent (`vetria-marketing.md`) — pesquisa + `templates/estrategia-midias-sociais.md` — antes de continuar (sem repetir a aula de boas práticas se essa não for a primeira interação com a empresa).

## Passo 2. Pesquisar

Use `WebSearch` para:
1. Datas comemorativas do mês relevantes para moda/varejo no Brasil.
2. Formatos de Reels/vídeo em alta no momento.
3. Eventos culturais grandes acontecendo ou chegando (esportivos, lançamentos de filme/série, etc.) que possam virar campanha — só liste os que fazem sentido real pro posicionamento da marca, não force conexão.

Sempre em fontes confiáveis, sempre cite a fonte quando trouxer um dado específico.

## Passo 3. Verificar campanhas da franqueadora e material recebido

Se a empresa for franquia/rede (Etapa 13 do Workbook DNA), verifique se há campanhas nacionais já definidas para o mês. Essas têm prioridade — incorpore ao calendário, nunca substitua por algo conflitante.

Verifique também `dna/marketing/material-campanha/index.md` (se existir) — material de campanha recebido pelo gestor via WhatsApp/Telegram, listado ali um bullet por item (data, arquivo, legenda, descrição). Mesma prioridade das campanhas da franqueadora: incorpore ao calendário os itens ainda não usados em nenhum calendário anterior, referenciando o arquivo real (`material-campanha/{nome-do-arquivo}`) — nunca invente um material que não chegou.

**Mesmo mês, ano anterior (sazonalidade — só entra em jogo com 1 ano+ de histórico).** Verifique se `dna/marketing/calendario-{mês alvo, mas do ano anterior}.md` existe (ex: montando setembro/2027, procure `calendario-2026-09.md`). **Se não existir, ignore este passo inteiro** — o calendário segue montado só com pesquisa + campanhas + material recebido, exatamente como já funciona hoje. Se existir: leia esse calendário antigo, depois filtre `entregas/registro-atividades.md` pelas linhas com agente "Vetria Marketing", status `validado` ou `não funcionou`, e data registrada dentro daquele mesmo mês/ano (mesmo filtro que `/marketing-fechamento-mensal` Passo 2 já usa). Use como sinal de prioridade: temas/formatos `validado` no mesmo mês do ano passado entram como candidato forte a repetir (adaptado, nunca copiado igual); os `não funcionou` são evitados. Nunca trate isso como obrigatório — é sinal a considerar, junto com a pesquisa de tendências atual.

## Passo 4. Montar o calendário

Use `templates/calendario-editorial.md` como estrutura. **Todo dia do mês recebe uma linha agora, não só os dias com gancho real:**
- **Dias com gancho real** (data comemorativa, campanha, tendência): tema/data específico, formato sugerido, ideia curta de conteúdo — como já era.
- **Dias comuns** (sem gancho): puxe a sugestão-base de `dna/marketing/estrategia-midias-sociais.md` pro dia da semana correspondente (ex: toda terça sem gancho especial ainda leva a sugestão-base de terça do ritmo semanal) — não deixe a linha vazia.

**Achado real, 2026-09-03: "ritmo-base"/"sugestão-base" são termos internos, só pra você entender de onde vem o conteúdo — nunca escreva essas palavras na coluna "Tema / Data" nem em nenhum lugar visível do calendário.** Uma loja viu literalmente "ritmo-base" como se fosse o título do dia, sem sentido nenhum pra quem lê. Na coluna "Tema / Data" de um dia comum, escreva a sugestão de conteúdo de verdade (ex: "Dica de combinação pro look de trabalho", não "ritmo-base" nem "sugestão-base terça").

Adapte tudo ao tom de comunicação do Workbook DNA.

Salve em `minhas-empresas/{ativa}/dna/marketing/calendario-{AAAA-MM}.md`.

## Passo 5. Entregar

Mostre um resumo (não o calendário inteiro) no chat: quantos dias com gancho real vs. ritmo-base, os 2-3 destaques do mês. Informe o caminho completo. Sugira rodar `/marketing-sugestao-do-dia` (manual ou agendado) para começar a usar o calendário no dia a dia.

Se o Passo 3 encontrou e usou o padrão do mesmo mês no ano anterior, mencione isso em 1 linha (ex: "📅 Repetiu 2 temas validados em {mês}/{ano anterior}, evitou 1 que não funcionou").
