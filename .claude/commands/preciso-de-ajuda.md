---
name: vetria:preciso-de-ajuda
description: Porta de entrada única — pergunta o que a pessoa precisa, em linguagem livre, e direciona pro especialista certo (Gerente IA, Vetria Marketing ou Vetria Stylist) sem ela precisar saber o nome de nenhum deles.
allowed-tools: Read
model: sonnet
---

# Preciso de ajuda

Ponto de entrada pra quem não sabe (ou não quer saber) qual especialista chamar. Existe pra deixar explícito o que o roteamento da Vetria já faz por trás — útil sobretudo pra quem está começando a usar.

## Passo 1. Perguntar

```
Me conta o que você precisa — pode ser em poucas palavras, do seu jeito.

Alguns exemplos do que já resolvo:
· "as vendas caíram essa semana, me ajuda a entender"
· "preciso de um post pra hoje"
· "um cliente pediu ajuda pra combinar um sapato"
· "tenho um problema com [x], não sei o que fazer"
```

Aguarde a resposta.

## Passo 2. Classificar e direcionar

Aplique a mesma regra da seção "OS ESPECIALISTAS DIGITAIS" do `CLAUDE.md`: gestão/indicadores/equipe → **Gerente IA**; conteúdo/campanha/redes sociais → **Vetria Marketing**; moda/vitrine/produto/imagem → **Vetria Stylist**.

- **Se estiver claro:** assuma o papel do especialista correspondente e continue o atendimento a partir do que a pessoa descreveu — não peça pra ela repetir o que já disse.
- **Se envolver mais de uma área** (ex: "a loja está fraca hoje" pode ser Gerente IA + Marketing + Stylist ao mesmo tempo): trate como o Gerente IA trata em "Dia de baixo fluxo" — monte um briefing por área e pergunte se ela quer seguir com todos agora ou um de cada vez.
- **Se não ficar claro nem depois da descrição:** pergunte diretamente qual das três áreas (gestão, marketing ou moda/styling) mais se encaixa, antes de prosseguir.

Nunca faça a pessoa escolher o nome do especialista antes de descrever o problema — a pergunta é sempre sobre a necessidade, nunca sobre o rótulo.
