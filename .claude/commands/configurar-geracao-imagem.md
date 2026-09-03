---
name: vetria:configurar-geracao-imagem
description: Explica como funciona a geração de imagem (já habilitada por padrão, com teto mensal) usada pelo Gerente IA, Vetria Marketing e Vetria Stylist.
allowed-tools: Read
model: sonnet
---

# Geração de Imagem

Achado real, 2026-09-03: isso deixou de ser um passo de configuração. Antes, cada loja precisava criar conta na OpenRouter e colar a própria chave — hoje a geração já vem pronta pra usar em toda loja, sem nenhuma etapa extra.

## Como funciona

Ao pedir uma prancha, look ou imagem, o Gerente IA, o Vetria Marketing e a Vetria Stylist geram a imagem de verdade direto, sempre entregando também o prompt pronto como alternativa (pra usar em outra ferramenta se preferir).

**Teto mensal:** cada loja tem direito a um número de imagens geradas por mês, incluído sem custo adicional. Ao atingir o teto, a geração direta pausa até o mês seguinte — o prompt pronto continua disponível normalmente, sem nenhuma interrupção.

## Se pedirem pra rodar este comando

Explique o funcionamento acima. Se quiser saber quantas imagens já foram geradas neste mês, informe que essa informação não está disponível aqui no chat ainda — oriente a usar `/falar-com-suporte` se precisar confirmar o número exato.

Não há chave, conta nem `.env` pra mexer aqui — não tente configurar nada.
