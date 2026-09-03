# O que exige sua ação manual — Vetria VOS

Quase toda a configuração da Vetria acontece dentro da própria conversa — você não sai da tela pra nada. Só um punhado de passos depende de você abrir outro site ou app, porque envolve **criar uma conta num serviço externo** (nenhum deles é operado pela Vetria, e nenhum é obrigatório pra começar a usar). Este documento existe pra você saber, antes de começar, exatamente o que vai precisar fazer com as próprias mãos — sem surpresa no meio do caminho.

Cada item abaixo tem um comando correspondente (`/configurar-...`) que guia o passo a passo dentro da própria conversa, pedindo um dado de cada vez. Este documento é só o resumo do que esperar antes de começar.

## Resumo rápido

| Serviço | Pra quê | Obrigatório? | Onde | Custo | Tempo |
|---|---|---|---|---|---|
| Telegram | Relatórios automáticos e conversa com o Gerente IA | Recomendado | Telegram | Grátis | ~1 min |
| WhatsApp (Z-API) | Alternativa ao Telegram, pelo número da loja | Opcional | app.z-api.io | Grátis p/ testar · a partir de ~R$60/mês | ~5 min |
| Geração de imagem (OpenRouter) | Gerar pranchas e imagens direto na conversa | Opcional | openrouter.ai | Pré-pago, centavos por imagem | ~3 min |

Nenhum desses três precisa estar pronto pra começar a usar a Vetria — os especialistas funcionam sem eles (sem canal configurado, você só não recebe relatório automático; sem geração de imagem, você recebe o prompt pronto pra usar em outra ferramenta).

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

## 3. Geração de imagem via OpenRouter (opcional)

**Por quê é manual:** gerar imagem tem custo real por chamada, então precisa de uma conta com crédito pré-pago — não tem como a Vetria criar essa conta por você.

**O que você vai fazer, fora da Vetria:**
1. Criar conta em openrouter.ai.
2. Adicionar crédito (pode começar pequeno, R$20–50 pra testar).
3. Gerar uma chave em openrouter.ai/keys (começa com `sk-or-`).

**De volta na Vetria:** rode `/configurar-geracao-imagem` e cole a chave — o comando testa gerando uma imagem simples antes de confirmar.

**Sem essa chave configurada:** o Gerente IA, o Vetria Marketing e o Vetria Stylist continuam funcionando normalmente — só entregam o prompt pronto pra usar em outra ferramenta, em vez de gerar a imagem ali mesmo.

**Custo:** pré-pago, centavos por imagem (varia por modelo).

## O que a Vetria já faz sozinha, sem nenhum desses três

Pra contraste: tudo isso já acontece dentro da própria conversa, sem sair da tela e sem nenhuma conta externa —

- Criar a pasta da empresa e montar o painel visual personalizado
- Calcular indicadores (PA, ticket médio, conversão) direto da planilha de vendas
- Montar o calendário editorial do mês, com datas comemorativas e tendências
- Gerar pranchas de venda e sugestões de look a partir de foto real de produto
- Fechar o mês (vendas ou conteúdo) e apontar o que funcionou

## Perguntas frequentes

**Preciso configurar os três?** Não. Telegram é o único recomendado pra começar — os outros dois são opcionais e podem ser feitos a qualquer momento depois, rodando o comando correspondente de novo.

**Posso trocar de Telegram pra WhatsApp depois?** Sim, rode `/configurar-canal-relatorio` pra trocar o canal ativo a qualquer momento.

**E se eu travar num desses passos?** Cada comando (`/configurar-telegram`, `/configurar-whatsapp`, `/configurar-geracao-imagem`) tem uma seção própria de "se algo não bater com o guia" — as interfaces desses serviços mudam com o tempo, e o comando pesquisa a tela atual antes de desistir.
