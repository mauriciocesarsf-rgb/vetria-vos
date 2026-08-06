# Vetria VOS

Inteligência estratégica para moda e varejo. Roda dentro do **Claude Code**, transformando o chat nos três especialistas digitais da Vetria.

Não é software tradicional: é o **VOS (Vetria Operating System)**, um sistema de prompts estruturados (`CLAUDE.md`, agents, skills) que organiza a inteligência da empresa em especialistas digitais, seguindo a Constituição da Vetria.

## Onde roda

Abra esta pasta no Claude Code (VS Code) ou no Cursor. O `CLAUDE.md` é lido em toda conversa e apresenta a Vetria e os três especialistas disponíveis.

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
│   ├── skills/                  Base de conhecimento (vazio nesta fase, ver ARQUITETURA.md)
│   ├── commands/
│   │   ├── nova-filial.md                 Duplica a identidade de marca para uma unidade nova
│   │   ├── configurar-canal-relatorio.md  Escolhe Telegram (recomendado) ou WhatsApp
│   │   ├── configurar-telegram.md         Conecta o bot e escolhe contato/grupo
│   │   ├── configurar-whatsapp.md         Confirmação de risco + conecta a Z-API
│   │   ├── gerente-enviar-relatorio.md    Monta e envia o relatório de vendas (grupo)
│   │   ├── gerente-boas-vindas-mes.md     Análise individual por vendedor, uma msg por vez, pro canal do gerente
│   │   ├── gerente-fechamento.md          Fechamento mensal/semanal completo, documento pra reunião de desempenho
│   │   ├── gerente-dia-fraco.md           Playbook de ativação pra dias de baixo fluxo
│   │   └── gerente-resolver-problema.md   Triagem de problema: interno, ou externo com paliativo
│   └── settings.json            Permissões
├── .env.example                 Modelo das credenciais (Telegram e Z-API, sem valores)
├── templates/
│   ├── workbook-dna.md               Template do Workbook DNA (13 campos, baseado no Guia de Identidade de Marca)
│   ├── problemas-conhecidos.md       Template do registro de problemas operacionais recorrentes
│   ├── vendas-indicadores.csv        Template do bruto diário lido pelo Gerente IA
│   ├── corridas.csv                  Template de metas/campanhas de incentivo entre vendedores
│   ├── premios-especiais.csv         Template de prêmios por cargo/loja (não-ranking)
│   ├── meta-mensal-loja.csv          Template da cota/super mensal da loja
│   └── COMO-PREENCHER-indicadores.md Guia neutro de preenchimento (copiado por empresa)
├── painel/
│   ├── template.html            Painel visual (nome da empresa + os 3 especialistas), personalizado por empresa
│   └── assets/                  Selos VG./VM./VS. e marca Vetria
└── minhas-empresas/             Dados das empresas clientes (não sobe pro git, ver README.md interno)
    └── {slug}/painel.html           Painel gerado para essa empresa
```

## Os três especialistas

| Especialista | Atua em |
|---|---|
| **Gerente IA** | Gestão, performance de vendedores e da equipe, planejamento semanal e mensal, indicadores |
| **Vetria Marketing** | Marketing, comunicação, campanhas, conteúdo, calendário editorial |
| **Vetria Stylist** | Moda, styling, visual merchandising, direção de imagem, looks |

Cada um lê a **Pasta DNA** da empresa ativa (`minhas-empresas/{slug}/dna/`) como contexto operacional antes de atender, e mantém memória própria (global e por empresa) entre atendimentos.

## Redes e filiais

Cliente com mais de uma loja (franquia ou rede própria) não precisa implantar do zero em cada unidade. `/nova-filial` duplica o que é da marca (missão, visão, valores, posicionamento, identidade visual, tom de comunicação) a partir de uma empresa já cadastrada, e só pergunta de novo o que é específico da unidade nova (endereço, equipe, redes sociais). Indicadores de venda nunca são copiados — cada filial começa zerada. As unidades ficam registradas como irmãs (Etapa 13 do Workbook DNA de cada uma), o que permite ao Gerente IA comparar duas lojas quando pedido, lendo os indicadores de ambas.

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

## Próximos passos possíveis

Esta é a base arquitetural com os 3 primeiros especialistas. Quando fizer sentido, sem comprometer essa arquitetura:

- **Skills**: extrair conhecimento hoje embutido nos agents (frameworks de styling, calendário comercial de moda, indicadores de varejo) para `.claude/skills/`, deixando os agents mais enxutos.
- **Agendamento do relatório**: hoje `/gerente-enviar-relatorio` é manual; dá para agendar (skill `schedule`) para rodar sozinho todo dia, quando fizer sentido confiar isso a uma automação.
- **Monitoramento do site da franqueadora**: novo command para o Vetria Marketing conferir periodicamente o site oficial e já preparar campanhas locais quando algo novo for lançado (Instagram fica de fora por enquanto: sem API pública confiável, monitorar seria frágil e arriscaria os termos de uso).
- **Empacotamento desktop**: um wrapper Electron com instalador e painel visual, no molde do Fluxo Criativo, para distribuição a usuários não técnicos — só depois que o núcleo estiver validado em uso real.
