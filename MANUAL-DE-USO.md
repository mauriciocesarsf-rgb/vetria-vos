# Manual de uso — Vetria VOS

Guia prático pra quem vai usar o Vetria no dia a dia da loja. Não é preciso saber programar — tudo acontece numa conversa normal, em português.

## 1. Onde abrir

O Vetria roda dentro do **Claude Code**. Abra a pasta do projeto (`vetria-vos`) no Claude Code (VS Code ou Cursor) e comece a digitar — não tem botão de "iniciar", a conversa já é a ferramenta.

Toda vez que você abre uma conversa nova, o sistema confere sozinho se há alguma atualização da matriz (silencioso, não precisa fazer nada).

## 2. Primeira ativação da empresa

Na primeira conversa, o Vetria vai perguntar:

1. **Nome da empresa**
2. **Segmento** (calçados, vestuário, acessórios, multimarca, etc.)

Com isso, ele já cria a pasta da empresa, gera o **painel visual** personalizado e pergunta se você quer continuar preenchendo o **Workbook DNA** (a "ficha completa" da empresa: missão, valores, público, produtos, tom de comunicação, identidade visual, equipe) ou já ir direto pra um especialista.

Você não precisa preencher tudo de uma vez. Pode ir completando aos poucos — o sistema sempre avisa o que ainda falta e nunca inventa uma informação que você não deu.

**Se a empresa for uma franquia:** cole a missão, visão, valores e identidade visual exatamente como a franqueadora define, em vez de criar uma versão própria.

## 3. Não sabe por onde começar?

Digite `/preciso-de-ajuda` e descreva o que precisa com suas palavras — não precisa saber o nome de nenhum especialista, o sistema direciona sozinho.

Quando achar que a Pasta DNA está pronta (ou mesmo sem estar — o comando pergunta se você quer completar antes ou depois), rode `/estamos-prontos`: os três especialistas olham juntos pra empresa e devolvem um plano de ação até o fim do mês, a partir dos dados que já existem.

## 4. Os três especialistas

| Especialista | Quando chamar |
|---|---|
| **Gerente IA** | Performance de vendedores e da equipe, metas, indicadores, planejamento da semana/mês, resolver um problema operacional |
| **Vetria Marketing** | Campanhas, conteúdo pra redes sociais, calendário editorial, tendências |
| **Vetria Stylist** | Looks, vitrine, pranchas de venda pro vendedor usar com o cliente, imagens de produto |

Você não precisa escolher o especialista certo de antemão — é só descrever o que precisa, em linguagem normal, e o sistema direciona. Se o pedido misturar assuntos (ex: "a loja está fraca hoje, preciso de ideia de conteúdo e um vendedor pediu ajuda com um look"), o próprio especialista te oferece passar o contexto pronto pra outro, sem você ter que explicar tudo de novo.

## 5. Indicadores (Gerente IA)

O Gerente IA lê os dados direto de `minhas-empresas/{sua-loja}/dna/indicadores/`:

- **`vendas.csv`** — o lançamento diário por vendedor (valor vendido, tickets, peças, clientes atendidos). É o único lugar onde você lança número — o sistema calcula sozinho PA, ticket médio, venda média e conversão. **Nunca calcule esses índices na mão antes de lançar.**
- **`meta-mensal-loja.csv`** — a cota (e a meta "super", se houver) do mês. Cadastrada na aba **Meta** da Área Adm.
- **`corridas.csv`** — competições **entre vendedores**, sempre um ranking: quem vende mais (faturamento), tem melhor P.A., melhor ticket médio ou melhor venda média ganha. Cadastrada na aba **Corridas**. Assim que você salva a meta do mês (item acima), o sistema já cria sozinho a corrida de acompanhamento de faturamento do mês — você não precisa cadastrar de novo; só entra na aba Corridas se quiser mexer no prêmio dela ou criar uma competição extra (ex: um desafio de ticket médio só numa semana).
- **`premios-especiais.csv`** — prêmios que **não são disputa entre vendedores**: por cargo específico, ou pra equipe toda junto. Cadastrada na aba Meta, embaixo da meta do mês. Dois tipos de exemplo:
  - **Por cargo**: "Estoquista ganha R$100 se a taxa de cancelamento ficar abaixo de 2% no mês" (beneficiário: Estoquista) — ou "Gerente ganha 5% de bônus se a loja bater a meta super" (beneficiário: Gerente).
  - **Pra loja toda**: "Equipe toda ganha confraternização paga se a loja bater a meta do mês" — ou "Day off extra pra todo mundo se não tiver nenhum atraso de abertura no mês" (beneficiário: Equipe toda).
  Cada prêmio tem um campo **"Automatizável?"**: se o dado já existe em algum arquivo (ex: "loja bater a meta" — o sistema já soma `vendas.csv` e compara com `meta_loja` sozinho), marque **sim**, e a Vetria confirma sozinha se a condição foi cumprida. Se for algo que só uma pessoa sabe (ex: atendimento, comportamento), marque **não** — a Vetria vai só lembrar que o prêmio está pendente de confirmação, nunca inventa que foi cumprido.

O arquivo `dna/indicadores/COMO-PREENCHER.md` explica linha a linha como preencher cada planilha. Mantendo esses arquivos atualizados, você não precisa mandar número nenhum pelo chat — o Gerente IA já lê tudo sozinho, sempre recalculando na hora (nunca reaproveita um número de conversa anterior).

## 6. Comandos (`/`)

Comandos são atalhos pra tarefas específicas — digite `/` no chat pra ver a lista, ou já digite o nome direto.

**Entrada e largada**
| Comando | O que faz |
|---|---|
| `/preciso-de-ajuda` | Porta de entrada única: descreve a necessidade, o sistema direciona pro especialista certo |
| `/estamos-prontos` | Confere a Pasta DNA e monta um plano de ação até o fim do período, com os três especialistas juntos |

**Gerente IA**
| Comando | O que faz |
|---|---|
| `/gerente-enviar-relatorio` | Manda um relatório curto de acompanhamento (meta ou ranking) pro grupo — sempre pede confirmação antes de enviar |
| `/gerente-boas-vindas-mes` | Análise individual por vendedor no início do mês, uma mensagem por vez, pro seu canal pessoal (você decide o que repassar pra cada um) |
| `/gerente-fechamento` | Fechamento completo (mensal ou semanal): faturamento, melhores/piores dias, indicadores por vendedor com pontuação, pra apoiar uma reunião de desempenho de verdade |
| `/gerente-dia-fraco` | Playbook de ativação pra um dia de movimento fraco: scripts de contato pra equipe usar, mais pedido de conteúdo rápido pro Marketing e Stylist |
| `/gerente-resolver-problema` | Ajuda a resolver um problema operacional (verifica se já é conhecido, classifica como interno/externo, propõe solução) |

**Vetria Marketing**
| Comando | O que faz |
|---|---|
| `/marketing-criar-calendario` | Monta o calendário editorial do mês (datas comemorativas, campanhas da franquia, tendências) |
| `/marketing-sugestao-do-dia` | Manda a sugestão de conteúdo de hoje (baseada no calendário) pro seu canal pessoal |
| `/marketing-fechamento-mensal` | Fecha o mês de conteúdo: o que funcionou, o que não, o que repetir |
| `/marketing-corrida-conteudo` | Cria uma corrida de criação de conteúdo entre vendedores |

**Configuração (roda uma vez só)** — veja [MANUAL-CONFIGURACAO-INICIAL.md](MANUAL-CONFIGURACAO-INICIAL.md) pra saber, antes de começar, o que cada um pede fora da conversa (Telegram, WhatsApp, geração de imagem — os únicos passos que não dá pra automatizar)
| Comando | O que faz |
|---|---|
| `/configurar-canal-relatorio` | Escolhe Telegram (recomendado) ou WhatsApp pros relatórios automáticos |
| `/configurar-telegram` | Passo a passo pra adicionar o bot da Vetria (já pronto, compartilhado) no grupo/contato e pegar os IDs de destino |
| `/configurar-envio-automatico` | Liga o envio automático de verdade: frequência, horário e quem avisar se falhar — depois disso o relatório sai sozinho, sem precisar abrir o Vetria |
| `/configurar-whatsapp` | Passo a passo pra conectar via Z-API (tem risco de banimento do número — o sistema avisa antes) |
| `/configurar-geracao-imagem` | Explica como funciona a geração de imagem (já vem habilitada por padrão, com teto mensal — não é mais um passo de configuração) |
| `/configurar-suporte` | Conecta o canal de contato com o administrador da plataforma |
| `/nova-filial` | Cria uma segunda loja/filial reaproveitando a identidade de marca, sem repetir a implantação do zero |
| `/atualizar-painel` | Recalcula o painel visual com os dados mais recentes |

## 7. O painel visual

Cada empresa ativa tem um painel em `minhas-empresas/{sua-loja}/painel.html` — abra esse arquivo em qualquer navegador. Ele mostra os três especialistas, os indicadores do mês, as corridas vigentes, a sugestão de conteúdo do dia e a atividade recente.

Ele **não atualiza sozinho em tempo real** (é um arquivo estático) — depois de lançar vendas novas, criar uma corrida ou gerar o calendário do mês, rode `/atualizar-painel` pra ele refletir os dados mais recentes.

## 8. O que foi feito, e o que já foi validado

Tudo que os especialistas entregam (relatório, calendário, plano, prancha) fica registrado em `minhas-empresas/{sua-loja}/entregas/registro-atividades.md`, com status `pendente validação`. Quando você souber se algo deu certo ou não, é só comentar na conversa ("aquela corrida funcionou", "o post de ontem não performou") — o especialista atualiza o registro sozinho. Isso também aparece resumido no bloco "Atividade recente" do painel.

## 9. Enviar mensagens automaticamente (opcional)

Existem dois níveis de automação, e vale saber a diferença:

- **Rodando `/gerente-enviar-relatorio` (ou `/marketing-sugestao-do-dia`) você mesmo, no chat**: mesmo com o canal configurado, o sistema sempre mostra a mensagem pronta e pergunta antes de enviar — nada sai sem você confirmar na hora.
- **Envio automático agendado** (configurado uma vez com `/configurar-envio-automatico`): depois de ligado, o relatório sai sozinho, no horário combinado, **sem pedir confirmação** — é literalmente pra isso que serve, pra loja não depender de alguém lembrar de rodar o comando. Se algo der errado nesse envio automático (token expirado, dado faltando), quem você designou como contato de erro recebe um aviso.

Pra ligar o canal sem o agendamento automático (só pra poder rodar os comandos manualmente com confirmação), use `/configurar-canal-relatorio`.

## 10. Falar com o suporte

`/falar-com-suporte` manda uma dúvida, problema técnico ou sugestão direto pra quem administra essa instalação do Vetria (configurado uma vez via `/configurar-suporte`). É pra questão sobre o próprio sistema — dúvida de gestão, marketing ou moda da sua empresa é com os especialistas, não com o suporte. A mensagem sempre fica salva localmente também, mesmo se o envio automático não estiver configurado.

## 11. Regras que valem sempre

- **Nunca inventa dado.** Se faltar uma informação (venda, seguidor, resultado de rede social), o sistema pergunta em vez de chutar.
- **Feedback individual de vendedor sempre passa por você.** O sistema nunca manda uma mensagem direto pro vendedor — só prepara o material pro gerente decidir o que e como repassar.
- **Fontes seguras.** Quando o sistema pesquisa algo na internet (tendência, solução de problema), ele sempre cita a fonte.
- **A pasta da sua empresa (`minhas-empresas/`) é só sua.** Nunca é enviada pra lugar nenhum além do que você configurar explicitamente.

## 12. Se travar

- **"Não sei o que perguntar"** — use `/preciso-de-ajuda` ou comece descrevendo a situação com suas palavras ("as vendas caíram essa semana", "preciso de post pro feed"), o sistema conduz a partir daí.
- **Dado sumiu ou número parece errado** — confira o arquivo `.csv` correspondente em `dna/indicadores/`; o sistema sempre relê o arquivo do zero, então um erro de digitação ali se reflete na análise.
- **Dúvida sobre um comando específico** — digite o nome do comando sem executar (`/gerente-fechamento` sozinho) e leia a descrição que aparece antes de confirmar.
- **Dúvida sobre o próprio sistema Vetria** — `/falar-com-suporte`.
- **O envio automático falhou** — se você configurou um contato de erro em `/configurar-envio-automatico`, ele recebe um aviso explicando o motivo. Sem contato de erro configurado, a falha fica só registrada internamente — vale rodar `/configurar-envio-automatico` de novo pra adicionar um.
