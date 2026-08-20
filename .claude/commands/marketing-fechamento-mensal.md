---
name: vetria:marketing-fechamento-mensal
description: Fechamento mensal de conteúdo — o que funcionou, o que não funcionou, e o que repetir no próximo mês, a partir do calendário do mês, da Validação de Ideias e da avaliação do usuário (o sistema não tem acesso a métricas do Instagram/TikTok) — já deixa um rascunho do calendário do mês seguinte pronto pra revisão do gerente.
allowed-tools: Read, Write, WebSearch
model: sonnet
---

# Vetria Marketing. Fechamento Mensal

Executa imediatamente: monta o relatório de fechamento do mês de conteúdo. Pensado para rodar no último dia do mês — agende com a skill `schedule` se quiser automático.

## Passo 1. Ler o calendário do mês

Leia `minhas-empresas/.ativa`. Leia `minhas-empresas/{ativa}/dna/marketing/calendario-{AAAA-MM do mês que está fechando}.md`.

Se não existir: informe que não há calendário registrado para esse mês, e pergunte se quer montar o fechamento só com o que o usuário lembrar, sem o calendário como referência.

## Passo 2. Ler o que já foi avaliado (Validação de Ideias)

**Limitação importante:** o sistema não tem acesso direto a métricas do Instagram/TikTok (visualizações, curtidas, alcance, vendas atribuídas). Nunca invente esses números.

Antes de perguntar ao usuário, leia `minhas-empresas/{ativa}/entregas/registro-atividades.md` — cada linha tem o formato `- **{data}** · {agente} · {título} · [ver arquivo]({caminho}) · status: {status}`. Filtre as linhas onde o agente é "Vetria Marketing" (ou equivalente) e o status começa com `validado` ou `não funcionou` (ignore `pendente validação` — ainda não foi avaliado). O texto depois do `—` no status, quando houver, é o motivo que a pessoa deu na Área Adm.

- **Se houver pelo menos 1-2 itens avaliados esse mês:** use isso diretamente como "o que funcionou"/"o que não funcionou" — é dado real, não precisa perguntar de novo ao usuário. Cite o item e o motivo registrado.
- **Se não houver dado suficiente** (ninguém avaliou nada na Validação de Ideias esse mês): caia no fluxo manual —
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

## Passo 4. Rascunhar o calendário do mês seguinte

Se `dna/marketing/calendario-{AAAA-MM do mês seguinte}.md` **ainda não existir**: monte um rascunho agora, seguindo **o processo completo de `/marketing-criar-calendario`, passo a passo, sem pular nenhum** — pesquisa de datas comemorativas via `WebSearch`, campanhas da franqueadora, **material recebido em `dna/marketing/material-campanha/index.md` (se existir)**, ritmo-base de `estrategia-midias-sociais.md` pros dias comuns, e sazonalidade (checar `calendario-{mesmo mês, ano anterior}.md` e o que validou/não funcionou naquele período, se existir) — mas **incorporando as recomendações do Passo 3** — repita o que foi validado, ajuste ou evite o que não funcionou.

Salve o rascunho normalmente em `dna/marketing/calendario-{AAAA-MM do mês seguinte}.md`. **Nunca trate como definitivo sem mostrar pro gerente primeiro** — apresente um resumo curto (destaques do mês + o que mudou por causa do aprendizado deste fechamento) e pergunte se está bom ou se quer ajustar algo antes de considerar pronto. Se o arquivo do mês seguinte já existir (alguém já rodou `/marketing-criar-calendario` antes), não sobrescreva — só informe que já existe.

## Regras

Nunca invente métrica que o usuário não informou. Se a resposta do Passo 2 for vaga, trabalhe com o que foi dado em vez de forçar números precisos.
