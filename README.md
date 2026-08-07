# Vetria VOS

Inteligência estratégica para moda e varejo. Roda dentro do **Claude Code**, transformando o chat nos três especialistas digitais da Vetria.

Não é software tradicional: é o **VOS (Vetria Operating System)**, um sistema de prompts estruturados (`CLAUDE.md`, agents, skills) que organiza a inteligência da empresa em especialistas digitais, seguindo a Constituição da Vetria.

## Onde roda

Abra esta pasta no Claude Code (VS Code) ou no Cursor. O `CLAUDE.md` é lido em toda conversa e apresenta a Vetria e os três especialistas disponíveis.

Pra quem vai usar no dia a dia (não precisa saber programar), o guia é o [`MANUAL-DE-USO.md`](MANUAL-DE-USO.md). Pra saber onde/como abrir o projeto (desktop ou web, o que cada cliente novo precisa ter), ver [`INSTALACAO.md`](INSTALACAO.md).

## Estrutura

```
vetria-vos/
├── CLAUDE.md                    Constituição da Vetria, regras globais, roteamento entre especialistas
├── ARQUITETURA.md               Como adicionar um novo agent, skill ou command
├── .claude/
│   ├── agents/                  Especialistas digitais (3 nesta fase)
│   │   ├── gerente-ia.md            Gestão, operação, performance comercial
│   │   ├── vetria-marketing.md      Marketing, comunicação, campanhas
│   │   └── vetria-stylist.md        Moda, styling, visual merchandising
│   ├── agents-memory/           Memória global de cada agent entre empresas (não sobe pro git)
│   ├── skills/
│   │   └── gerar-imagem/SKILL.md          Gera imagem via OpenRouter, direto no Claude Code
│   ├── commands/
│   │   ├── nova-filial.md                 Duplica a identidade de marca para uma unidade nova
│   │   ├── configurar-canal-relatorio.md  Escolhe Telegram (recomendado) ou WhatsApp
│   │   ├── configurar-telegram.md         Conecta o bot e escolhe contato/grupo
│   │   ├── configurar-whatsapp.md         Confirmação de risco + conecta a Z-API
│   │   ├── configurar-geracao-imagem.md   Conecta a OpenRouter (opcional)
│   │   ├── atualizar-painel.md            Recalcula indicadores/corridas/sugestão do dia no painel
│   │   ├── preciso-de-ajuda.md            Porta de entrada única: descreve a necessidade, o sistema direciona
│   │   ├── estamos-prontos.md             Largada: confere a Pasta DNA e monta um plano dos 3 especialistas juntos
│   │   ├── configurar-suporte.md          Conecta o canal de contato com o administrador da plataforma
│   │   ├── falar-com-suporte.md           Envia dúvida/problema/sugestão pro administrador
│   │   ├── gerente-enviar-relatorio.md    Monta e envia o relatório de vendas (grupo)
│   │   ├── gerente-boas-vindas-mes.md     Análise individual por vendedor, uma msg por vez, pro canal do gerente
│   │   ├── gerente-fechamento.md          Fechamento mensal/semanal completo, documento pra reunião de desempenho
│   │   ├── gerente-dia-fraco.md           Playbook de ativação pra dias de baixo fluxo
│   │   ├── gerente-resolver-problema.md   Triagem de problema: interno, ou externo com paliativo
│   │   ├── marketing-criar-calendario.md  Calendário editorial do mês (datas, franquia, tendências)
│   │   ├── marketing-sugestao-do-dia.md   Sugestão diária pro canal pessoal do gestor
│   │   ├── marketing-fechamento-mensal.md O que funcionou/não funcionou no mês de conteúdo
│   │   └── marketing-corrida-conteudo.md  Corrida de criação de conteúdo pros vendedores
│   └── settings.json            Permissões
├── .env.example                 Modelo das credenciais (Telegram e Z-API, sem valores)
├── templates/
│   ├── workbook-dna.md               Template do Workbook DNA (13 campos, baseado no Guia de Identidade de Marca)
│   ├── problemas-conhecidos.md       Template do registro de problemas operacionais recorrentes
│   ├── vendas-indicadores.csv        Template do bruto diário lido pelo Gerente IA
│   ├── corridas.csv                  Template de metas/campanhas de incentivo entre vendedores
│   ├── premios-especiais.csv         Template de prêmios por cargo/loja (não-ranking)
│   ├── meta-mensal-loja.csv          Template da cota/super mensal da loja
│   ├── COMO-PREENCHER-indicadores.md Guia neutro de preenchimento (copiado por empresa)
│   ├── calendario-editorial.md       Template do calendário mensal do Vetria Marketing
│   └── corridas-conteudo.csv         Template de corridas de criação de conteúdo
├── painel/
│   ├── template.html            Painel visual (nome da empresa, os 3 especialistas e indicadores/corridas/sugestão do dia), personalizado por empresa
│   └── assets/                  Selos VG./VM./VS. e marca Vetria
└── minhas-empresas/             Dados das empresas clientes (não sobe pro git, ver README.md interno)
    └── {slug}/painel.html           Painel gerado para essa empresa
```

## Os três especialistas

| Especialista | Atua em |
|---|---|
| **Gerente IA** | Gestão, performance de vendedores e da equipe, planejamento semanal e mensal, indicadores |
| **Vetria Marketing** | Marketing, comunicação, campanhas, conteúdo, calendário editorial, pesquisa de tendências |
| **Vetria Stylist** | Moda, styling, visual merchandising, direção de imagem, looks, pranchas de venda pro vendedor |

Cada um lê a **Pasta DNA** da empresa ativa (`minhas-empresas/{slug}/dna/`) como contexto operacional antes de atender, e mantém memória própria (global e por empresa) entre atendimentos.

## Redes e filiais

Cliente com mais de uma loja (franquia ou rede própria) não precisa implantar do zero em cada unidade. `/nova-filial` duplica o que é da marca (missão, visão, valores, posicionamento, identidade visual, tom de comunicação) a partir de uma empresa já cadastrada, e só pergunta de novo o que é específico da unidade nova (endereço, equipe, redes sociais). Indicadores de venda nunca são copiados — cada filial começa zerada. As unidades ficam registradas como irmãs (Etapa 13 do Workbook DNA de cada uma), o que permite ao Gerente IA comparar duas lojas quando pedido, lendo os indicadores de ambas.

## Painel visual

Cada empresa ativa tem um painel HTML personalizado (`minhas-empresas/{slug}/painel.html`, gerado a partir de `painel/template.html`): Vetria Marketing no escritório de planejamento (calendário e quadros na parede), Gerente IA no caixa e Vetria Stylist no salão de vendas (mostruário, manequim e espelho), além de uma "foto do dia" com indicadores do mês, corridas vigentes e a sugestão de conteúdo de hoje.

Os campos estáticos (nome, segmento, cor de marca) são definidos na ativação da empresa. Os blocos dinâmicos (indicadores, corridas, sugestão do dia, atividade) mudam com o tempo — rode `/atualizar-painel` para recalculá-los sem repetir a ativação completa.

A tela em si recarrega sozinha a cada 5 minutos (bom pra deixar aberta numa TV da loja), mas isso só reflete dado novo se `/atualizar-painel` também tiver rodado recentemente — vale agendar esse comando com a skill `schedule` se o objetivo for uma tela sempre viva.

## Entrada, largada e acompanhamento

- `/preciso-de-ajuda` — porta de entrada única pra quem não sabe (ou não quer saber) qual especialista chamar: descreve a necessidade em linguagem livre, o sistema direciona.
- `/estamos-prontos` — largada oficial: confere se a Pasta DNA está completa (com a opção de completar antes ou seguir e completar depois) e devolve um plano de ação até o fim do período, com a visão dos três especialistas juntos a partir dos dados que já existem.
- `entregas/registro-atividades.md` — log único, compartilhado pelos três especialistas, de tudo que foi entregue e seu status (pendente de validação / validado / não funcionou). Aparece resumido no bloco "Atividade recente" do painel.
- `/configurar-suporte` e `/falar-com-suporte` — canal de contato direto com quem administra essa instalação do Vetria (dúvida sobre o sistema, problema técnico, sugestão) — sempre salva uma cópia local da mensagem, mesmo sem o envio automático configurado.

## Indicadores e relatório automático

O Gerente IA lê `dna/indicadores/` antes de qualquer análise: `vendas.csv` (bruto diário por vendedor), `corridas.csv` (metas/campanhas entre vendedores), `premios-especiais.csv` (prêmios por cargo ou pela loja, não-ranking) e `meta-mensal-loja.csv` (cota e super do mês). Ele recalcula tudo a cada vez que é acionado — nunca reaproveita um número de uma resposta anterior.

Para enviar automaticamente, rode `/configurar-canal-relatorio` uma vez: ele pergunta o canal — **Telegram é o recomendado** (gratuito, sem risco de bloqueio); **WhatsApp exige uma confirmação explícita de risco** antes de conectar, porque a automação via Z-API pode banir o número conectado a qualquer momento, e a experiência mostra que clientes tendem a ignorar avisos em texto e conectar o número principal da loja mesmo assim — por isso a confirmação é um passo obrigatório, não uma nota de rodapé. Depois de configurado:

- `/gerente-enviar-relatorio` — acompanhamento rápido, mensagem curta pro grupo (meta ou ranking), sempre com confirmação antes de disparar.
- `/gerente-boas-vindas-mes` — início do mês, análise individual por vendedor (meta pessoal, corridas vigentes, ponto forte e ponto de melhoria do mês anterior, sugestão prática), uma mensagem separada por vendedor — todas para o canal do próprio **gerente**, nunca direto pro vendedor. O gerente é sempre quem entrega o feedback ao time; a Vetria só prepara o material.
- `/gerente-fechamento` — análise completa (mensal todo dia 1, ou semanal toda segunda), não uma mensagem curta: faturamento, melhores/piores dias com hipóteses, indicadores da loja e de cada vendedor com pontuação (⭐/🟡/🔴) e recomendações, salva como documento em `entregas/gestao/` pra apoiar uma reunião de desempenho de verdade. Pode opcionalmente avisar o gerente (nunca o grupo) que está pronto, com um resumo executivo curto.
- `/gerente-dia-fraco` — não depende de canal configurado, é conversa direta: monta um playbook de ativação pra dias de baixo fluxo (scripts de contato ativo pra cada vendedor usar na própria carteira de clientes, mais briefings prontos pro Vetria Marketing e o Vetria Stylist produzirem conteúdo rápido).

Nunca envia nada automaticamente sem confirmação explícita do usuário na hora — mesmo com o canal configurado, enviar é sempre um ato deliberado.

**Rotina.** Os três comandos são manuais por padrão. Para rodarem sozinhos (relatório toda manhã, boas-vindas todo dia 1, fechamento mensal todo dia 1 e semanal toda segunda), use a skill `schedule`. Nos últimos dias do mês (ou de uma corrida perto do fim), vale agendar o relatório com mais frequência — o Gerente IA já aumenta o tom de urgência sozinho nesse período, mas a cadência de envio é você quem define no agendamento.

## Solução de problemas

`/gerente-resolver-problema` recebe um problema operacional e faz a triagem: verifica primeiro `dna/problemas-conhecidos.md` (nunca repesquisa um problema recorrente do zero), classifica como **interno** (a loja resolve sozinha) ou **externo** (depende de franqueadora, fornecedor, sistema), confere contra o Workbook DNA antes de propor qualquer solução, e pesquisa na internet via `WebSearch` só quando necessário — sempre em fontes confiáveis, sempre citando a fonte. Se for externo, entrega sempre duas coisas: para onde encaminhar a solução definitiva, e uma solução paliativa concreta pra usar enquanto isso. Todo problema resolvido fica registrado.

## Calendário e tendências (Vetria Marketing)

`/marketing-criar-calendario` monta o calendário editorial do mês (`dna/marketing/calendario-{AAAA-MM}.md`): datas comemorativas, campanhas já definidas pela franqueadora (nunca substituídas por algo conflitante) e oportunidades de tendência pesquisadas via `WebSearch` (formatos de Reels em alta, momentos culturais que façam sentido pro posicionamento da marca — nunca forçado).

- `/marketing-sugestao-do-dia` — lê a entrada de hoje no calendário e manda pro canal pessoal do gestor (reaproveita o destino `_GERENTE`, sem configurar de novo).
- `/marketing-fechamento-mensal` — o que funcionou/não funcionou no mês, perguntado ao usuário (o sistema não acessa métricas do Instagram/TikTok, nunca inventa número), com recomendações pro próximo mês.
- `/marketing-corrida-conteudo` — corrida de criação de conteúdo entre vendedores (`dna/marketing/corridas-conteudo.csv`), sempre com sugestões concretas de o quê e como criar, com opção de anunciar no grupo.

## Geração de imagem (Gerente IA, Vetria Marketing e Vetria Stylist)

Fica tudo dentro do Claude Code — a skill `gerar-imagem` usa a OpenRouter pra gerar a imagem a partir do prompt que o agent já montou, sem precisar sair pra outra plataforma. Configuração opcional via `/configurar-geracao-imagem`; sem ela, os agents continuam funcionando normalmente, só entregam o prompt pronto. **O prompt é sempre entregue de qualquer forma** — é a opção B pra tentar em outra ferramenta (Midjourney, ChatGPT, etc.) se preferir. Vetria Stylist usa pra looks/pranchas/fotos; Vetria Marketing pode usar direto pra peças simples de conteúdo sem precisar do Stylist; Gerente IA pode usar direto pra cards de indicador/ranking e banners de corrida ou prêmio.

## Próximos passos possíveis

Esta é a base arquitetural com os 3 primeiros especialistas. Quando fizer sentido, sem comprometer essa arquitetura:

- **Monitoramento do site da franqueadora**: novo command para o Vetria Marketing conferir periodicamente o site oficial e já preparar campanhas locais quando algo novo for lançado (Instagram fica de fora por enquanto: sem API pública confiável, monitorar seria frágil e arriscaria os termos de uso).
- **Empacotamento desktop**: um wrapper Electron com instalador e painel visual, no molde do Fluxo Criativo, para distribuição a usuários não técnicos — só depois que o núcleo estiver validado em uso real.
