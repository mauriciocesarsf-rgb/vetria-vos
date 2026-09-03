# O que exige sua ação manual — Vetria VOS

Quase toda a configuração da Vetria acontece dentro da própria conversa — você não sai da tela pra nada. Só um punhado de passos depende de você abrir outro site ou app, porque envolve **criar uma conta num serviço externo** (nenhum deles é operado pela Vetria, e nenhum é obrigatório pra começar a usar). Este documento existe pra você saber, antes de começar, exatamente o que vai precisar fazer com as próprias mãos — sem surpresa no meio do caminho.

Cada item abaixo tem um comando correspondente (`/configurar-...`) que guia o passo a passo dentro da própria conversa, pedindo um dado de cada vez. Este documento é só o resumo do que esperar antes de começar.

## Resumo rápido

| Serviço | Pra quê | Obrigatório? | Onde | Custo | Tempo |
|---|---|---|---|---|---|
| Telegram | Relatórios automáticos e conversa com o Gerente IA | Recomendado | Telegram | Grátis | ~1 min |
| WhatsApp (Z-API) | Alternativa ao Telegram, pelo número da loja | Opcional | app.z-api.io | Grátis p/ testar · a partir de ~R$60/mês | ~5 min |

Nenhum desses dois precisa estar pronto pra começar a usar a Vetria — sem canal configurado, você só não recebe relatório automático. (Geração de imagem não entra mais nessa lista — acontece automaticamente, sem nenhuma conta ou configuração da sua parte, ver seção abaixo.)

## 1. Telegram — relatórios e conversa (recomendado)

**Por quê é manual:** adicionar o bot num grupo ou abrir uma conversa com ele são ações que só existem dentro do próprio Telegram — nenhum sistema externo consegue fazer isso por você. Mas não tem mais criação de bot nem BotFather: o bot da Vetria já existe e já vem pronto na instalação.

**O que você vai fazer, fora da Vetria:**
1. Abrir o Telegram, buscar o bot da Vetria pelo nome que o `/configurar-telegram` te mostrar.
2. Adicionar ele ao grupo da loja (se for usar relatório de grupo) e/ou abrir uma conversa individual com ele.

**De volta na Vetria:** rode `/configurar-telegram` — o resto (achar os IDs de destino, testar, salvar) o próprio comando faz perguntando um dado de cada vez.

**Custo:** zero, sempre. Sem limite de mensagens, sem risco de a conta ser bloqueada.

## 2. WhatsApp via Z-API — alternativa ao Telegram (opcional)

**Por quê é manual:** conectar precisa de uma conta na Z-API (serviço terceiro) e de escanear um QR Code com o celular que vai enviar as mensagens — nenhuma das duas coisas dá pra automatizar.

**Antes de escolher esse caminho, um ponto importante:** o WhatsApp não tem uma forma oficial e gratuita de automação como o Telegram tem. A Z-API simula um WhatsApp Web, e o número pode ser banido pelo WhatsApp a qualquer momento, sem aviso — por isso a recomendação é sempre usar um número secundário, nunca o principal da loja. O próprio `/configurar-whatsapp` exige uma confirmação explícita desse risco antes de continuar.

**O que você vai fazer, fora da Vetria:**
1. Criar conta em app.z-api.io.
2. Criar uma instância e assinar (necessário pra liberar o QR Code).
3. Escanear o QR Code com o WhatsApp que vai enviar os relatórios (número secundário).
4. Copiar Instance ID, Token e Client-Token.

**De volta na Vetria:** rode `/configurar-whatsapp` e cole as três credenciais — o comando testa a conexão, ajuda a achar o ID do grupo certo e salva tudo.

**Custo:** plano gratuito limitado pra testar; plano pago a partir de ~R$60/mês por instância.

## 3. Geração de imagem (automática — nada pra você fazer)

Achado real, 2026-09-03: isso já foi um passo manual (criar conta na OpenRouter, colar chave). Deixou de ser — a geração de imagem já vem habilitada, sem custo adicional pra loja, com um teto mensal de imagens incluído. Ao pedir uma prancha, look ou imagem, o Gerente IA, o Vetria Marketing e a Vetria Stylist geram a imagem de verdade direto, sempre entregando também o prompt pronto como alternativa. Ao atingir o teto do mês, a geração direta pausa até o mês seguinte — sem afetar o resto do uso da Vetria.

## O que a Vetria já faz sozinha, sem nenhum desses dois

Pra contraste: tudo isso já acontece dentro da própria conversa, sem sair da tela e sem nenhuma conta externa —

- Criar a pasta da empresa e montar o painel visual personalizado
- Calcular indicadores (PA, ticket médio, conversão) direto da planilha de vendas
- Montar o calendário editorial do mês, com datas comemorativas e tendências
- Gerar pranchas de venda e sugestões de look a partir de foto real de produto (imagem de verdade, não só o prompt)
- Fechar o mês (vendas ou conteúdo) e apontar o que funcionou

## Perguntas frequentes

**Preciso configurar os dois?** Não. Telegram é o único recomendado pra começar — WhatsApp é opcional e pode ser feito a qualquer momento depois, rodando o comando correspondente de novo.

**Posso trocar de Telegram pra WhatsApp depois?** Sim, rode `/configurar-canal-relatorio` pra trocar o canal ativo a qualquer momento.

**E se eu travar num desses passos?** Cada comando (`/configurar-telegram`, `/configurar-whatsapp`) tem uma seção própria de "se algo não bater com o guia" — as interfaces desses serviços mudam com o tempo, e o comando pesquisa a tela atual antes de desistir.
