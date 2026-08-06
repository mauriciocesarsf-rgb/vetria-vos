---
name: vetria:marketing-corrida-conteudo
description: Cria uma corrida de criação de conteúdo para incentivar a criatividade dos vendedores (ex: melhor Reels, mais Stories), com sugestões concretas de o quê e como criar, e oferece anunciar no grupo.
allowed-tools: Read, Write, Bash
model: sonnet
---

# Vetria Marketing. Corrida de Criação de Conteúdo

Executa imediatamente: cria uma corrida de conteúdo (diferente das corridas de venda do Gerente IA — aqui o critério é criatividade/produção, não faturamento).

## Passo 1. Definir a corrida

Pergunte (uma de cada vez, se o usuário não tiver dado tudo de uma vez):
1. Tema da corrida (ex: "Look da Semana", "Bastidor da Loja").
2. Formato (Reels, Stories, Feed, Carrossel, etc.).
3. Critério de vitória (quantidade de posts, ou qualidade/engajamento — se for qualidade, quem decide: o gestor, ou o post com mais curtidas/visualizações).
4. Período (início e fim).
5. Prêmio.

## Passo 2. Montar sugestões de conteúdo

Sempre inclua, mesmo sem ser pedido, ideias concretas de **o quê** criar e **como** criar — nunca deixe a corrida só com o tema solto. Baseie nas especialidades da empresa (produtos em destaque, identidade visual) e no que está em alta (pode usar `WebSearch` se fizer sentido pesquisar formato/tendência para essa corrida específica).

## Passo 3. Registrar

Leia `minhas-empresas/.ativa`. Salve/atualize `minhas-empresas/{ativa}/dna/marketing/corridas-conteudo.csv` (estrutura em `templates/corridas-conteudo.csv`: `periodo_inicio, periodo_fim, tema, formato, criterio, premio`).

## Passo 4. Oferecer anúncio no grupo

```
Corrida registrada. Quer que eu já anuncie no grupo da equipe?

1. Sim
2. Não, só registrar por enquanto
```

Se sim: verifique o canal de grupo configurado (`GERENTE_CANAL_RELATORIO` + `TELEGRAM_CHAT_ID_GRUPO` ou `GERENTE_WHATSAPP_DESTINO_GRUPO`, mesma lógica de `/gerente-enviar-relatorio` Passo 1). Se não configurado, acione `configurar-canal-relatorio` primeiro. Monte uma mensagem animada anunciando a corrida (tema, formato, prêmio, sugestões de como participar) no tom de comunicação da empresa, mostre a prévia, e só envie após confirmação.

## Regras

Nunca inclua julgamento negativo. Sugestões de conteúdo são sempre específicas e acionáveis, nunca genéricas ("seja criativo").
