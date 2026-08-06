---
name: vetria:marketing-criar-calendario
description: Cria o calendário editorial do mês — datas comemorativas, campanhas da franqueadora e oportunidades de tendência — com sugestão de formato e conteúdo por dia.
allowed-tools: Read, Write, WebSearch
model: sonnet
---

# Vetria Marketing. Criar Calendário do Mês

Executa imediatamente: monta o calendário editorial do mês corrente (ou do mês informado). Pensado para rodar no dia 1 de cada mês — agende com a skill `schedule` se quiser automático.

## Passo 1. Contexto

Leia `minhas-empresas/.ativa`. Leia `dna/workbook-dna.md` (posicionamento, tom de comunicação, público, produtos) e `dna/identidade-visual/` (materiais da franqueadora, se houver).

## Passo 2. Pesquisar

Use `WebSearch` para:
1. Datas comemorativas do mês relevantes para moda/varejo no Brasil.
2. Formatos de Reels/vídeo em alta no momento.
3. Eventos culturais grandes acontecendo ou chegando (esportivos, lançamentos de filme/série, etc.) que possam virar campanha — só liste os que fazem sentido real pro posicionamento da marca, não force conexão.

Sempre em fontes confiáveis, sempre cite a fonte quando trouxer um dado específico.

## Passo 3. Verificar campanhas da franqueadora

Se a empresa for franquia/rede (Etapa 13 do Workbook DNA), verifique se há campanhas nacionais já definidas para o mês. Essas têm prioridade — incorpore ao calendário, nunca substitua por algo conflitante.

## Passo 4. Montar o calendário

Use `templates/calendario-editorial.md` como estrutura. Para cada dia com gancho real (não todos os dias), defina: tema/data, formato sugerido, ideia curta de conteúdo. Adapte tudo ao tom de comunicação do Workbook DNA.

Salve em `minhas-empresas/{ativa}/dna/marketing/calendario-{AAAA-MM}.md`.

## Passo 5. Entregar

Mostre um resumo (não o calendário inteiro) no chat: quantos dias com conteúdo planejado, os 2-3 destaques do mês. Informe o caminho completo. Sugira rodar `/marketing-sugestao-do-dia` (manual ou agendado) para começar a usar o calendário no dia a dia.
