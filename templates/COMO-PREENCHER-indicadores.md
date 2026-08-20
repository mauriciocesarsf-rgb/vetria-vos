# Como preencher os indicadores

Seis arquivos, ritmos diferentes. Não existe uma planilha separada "da loja" — o total da loja em qualquer dia ou período é sempre a soma das linhas de `vendas.csv` daquele dia/período, calculada automaticamente. Só lance os dados de cada vendedor.

**Qual arquivo usar pra cada tipo de premiação:**
- Prêmio é uma disputa entre vendedores (quem vender mais, quem tiver melhor P.A. etc.)? → `corridas.csv`.
- Prêmio é uma meta única da loja inteira, ou de um cargo específico (gerente, estoquista), sem comparar vendedores entre si? → `premios-especiais.csv`.

## `vendas.csv` — todo dia, um bruto por vendedor

Só 4 números por linha. Nada de calcular PA, ticket médio ou venda média na mão — o Gerente IA calcula isso sozinho a partir do bruto.

| Coluna | O que é | Exemplo |
|---|---|---|
| `id` | Identificador único da linha (UUID), gerado automaticamente — nunca preencha na mão | `f1a2...` |
| `data` | Data do dia, formato AAAA-MM-DD | `2026-08-06` |
| `vendedor` | Nome do vendedor | `Nome do Vendedor` |
| `valor` | Faturamento (R$) do dia | `1720.50` |
| `tickets` | Número de vendas (tickets) fechadas | `7` |
| `pecas_liquidas` | Peças líquidas vendidas | `9` |
| `clientes_atendidos` | Quantos clientes foram atendidos | `15` |
| `atualizadoEm` | Data/hora da última alteração dessa linha, gerada automaticamente | `2026-08-13T14:02:00.000Z` |

Uma linha por vendedor por dia. Dia de folga: pode pular a linha desse dia para essa pessoa, ou lançar tudo zerado — o Gerente IA ignora dias sem atendimento no cálculo de médias.

**É um arquivo só, pra sempre — nunca crie um novo a cada mês nem apague linhas antigas.** É exatamente por manter o histórico completo, com a data de cada linha, que o Gerente IA consegue comparar meses (mês atual vs. mês anterior, ou o mesmo mês do ano passado, útil pra moda por causa da sazonalidade) sem precisar de nenhuma planilha extra.

**Este arquivo é autoridade do `vetria-backend`, não editado direto.** Lançamento é feito pela Área Adm do app (aba "Desempenho") ou pedindo pro Gerente IA no Telegram/WhatsApp da loja ("registra a venda de hoje da Kelly, R$450, 2 tickets") — os dois caminhos passam pela mesma API do backend, que é quem grava `id`/`atualizadoEm`. A cópia dentro de `dna/indicadores/` é só uma cópia de leitura, atualizada a cada sincronização — editá-la manualmente não tem efeito permanente, a próxima sincronização sobrescreve com a versão do backend.

## `escala-{AAAA-MM}.csv` — opcional, um arquivo por mês

O painel mostra, pra cada vendedor e pra loja, se estão "em ritmo" pra bater a meta até a data de hoje (verde) ou atrás (vermelho) — comparando o que já venderam com o que deveriam ter vendido até agora. Sem esse arquivo, esse cálculo assume que todo mundo trabalha todos os dias do mês (dias corridos). Preenchendo, o cálculo passa a descontar os dias de folga/falta/atestado/férias de cada um, ficando mais justo.

Cadastrado pela Área Adm do app (aba "Escala") — grade do mês, uma linha por vendedor, uma coluna por dia (`1, 2, 3, ...`), célula com um código (`F` = folga, `X` = falta, `A` = atestado, `FE` = férias) ou vazia (trabalha normal). Quem não aparece no arquivo do mês, ou se o arquivo não existir, é tratado como sem folga (dias corridos) nesse cálculo.

## `calendario-gerencial.json` — agenda do gestor (notas, reuniões, tarefas)

Diferente dos outros arquivos desta pasta, é **JSON, não CSV** (array que cresce pra sempre, mesmo espírito de `vendas.csv`) — cada item tem `id, data, hora, tipo (nota|reuniao|tarefa), titulo, descricao, vendedorId, prazo, concluida, atualizadoEm`. `hora` (formato `"HH:mm"`) é opcional, pra evento com horário marcado. `reuniao` pode ligar a um vendedor de `vendedores.json` por `vendedorId`; `tarefa` com `prazo` preenchido dispara um lembrete automático pelo `vetria-backend` no dia.

Cadastrado pela Área Adm (aba "Calendário") ou pedindo pro Gerente IA no chat/Telegram/WhatsApp ("registra uma reunião com a Kelly sobre o PA dela amanhã"). **Também é autoridade do backend, mesmo motivo de `vendas.csv`** — a cópia em `dna/indicadores/` é só leitura.

## `vendedores.json` — cadastro de cada vendedor (define quem está ativo)

Ao contrário dos outros arquivos desta pasta, não é CSV nem se preenche por template — é cadastrado direto no app, na Área Adm, tela "Vendedores" (botão "Novo Vendedor"). É lá que se define nome, função, datas, telefone, sonhos, objetivos e um valor de vendas pessoal, e é o botão "Ativar"/"Desativar" dessa tela — não mais ter lançamento em `vendas.csv` — que define quem conta como equipe ativa pros cálculos de meta. `vendas.csv` continua sendo só o histórico de vendas de cada um.

## `corridas.csv` — uma linha por meta ou campanha do mês

Cada linha é uma competição com início, fim, indicador e prêmio. Pode ter várias correndo ao mesmo tempo (ex: meta de faturamento da quinzena + corrida de P.A. do início do mês).

| Coluna | O que é | Exemplo |
|---|---|---|
| `periodo_inicio` | Primeiro dia da corrida | `2026-08-01` |
| `periodo_fim` | Último dia da corrida | `2026-08-08` |
| `nome` | Nome da corrida/campanha, como aparece na mensagem | `1º Período` |
| `metrica` | Qual indicador está em disputa: `valor` (faturamento), `pa`, `tm` (ticket médio) ou `pm` (venda média por atendimento) | `valor` |
| `meta_por_vendedor` | Meta/threshold do indicador. **Para `metrica=valor`, pode deixar em branco** — o Gerente IA calcula sozinho dividindo a fatia correspondente de `meta-mensal-loja.csv` pelo número de vendedores ativos no período. Para `pa`/`tm`/`pm`, informe o valor (é um patamar, não algo divisível). | `1.50` (para PA) ou vazio (para valor, se quiser cálculo automático) |
| `premio` | Premiação, se houver (opcional) — nem toda corrida precisa ter um valor em dinheiro, pode ser qualquer indicador | `R$ 50 em saldo livre para quem bater a meta primeiro` |

## `meta-mensal-loja.csv` — uma vez por mês

Meta total da loja no mês. É a referência que o Gerente IA usa para calcular a meta individual automática das corridas de faturamento (`metrica=valor`) que não tiverem `meta_por_vendedor` preenchida: ele pega a fatia do mês correspondente ao período da corrida e divide pelo número de vendedores que tiveram lançamento em `vendas.csv` naquele período.

| Coluna | O que é | Exemplo |
|---|---|---|
| `mes` | Mês de referência, formato AAAA-MM | `2026-08` |
| `meta_loja` | Cota do mês (R$) | `325000` |
| `meta_super` | Meta esticada/"super" do mês, se houver (opcional, deixe igual a `meta_loja` ou vazio se não usar) | `373750` |
| `bonificacao_cota_pct` | Percentual de bonificação pago à equipe se bater a cota, se houver (opcional) | `4.0` |
| `bonificacao_super_pct` | Percentual de bonificação pago à equipe se bater a super, se houver (opcional) | `4.3` |

## `premios-especiais.csv` — prêmios que não são disputa entre vendedores

Para premiações ligadas a um cargo específico ou à loja como um todo — não a uma comparação entre vendedores. Exemplos reais: gerente ganhar um prêmio se a loja bater a cota; estoquista ganhar um prêmio por manter a taxa de cancelamento baixa.

| Coluna | O que é | Exemplo |
|---|---|---|
| `periodo_inicio` / `periodo_fim` | Vigência do prêmio | `2026-08-01` / `2026-08-31` |
| `beneficiario` | Cargo ou pessoa que pode ganhar | `Gerente` |
| `condicao` | Em texto livre — a condição para ganhar | `Loja atingir a cota do mês` |
| `premio` | O prêmio | `R$ 300 em saldo livre no Caju` |
| `automatizavel` | `sim` se o Gerente IA consegue verificar sozinho com os dados que já tem (`vendas.csv` + `meta-mensal-loja.csv`), `nao` se depende de um dado que o sistema ainda não rastreia (ex: taxa de cancelamento) — nesse caso, quem preenche a planilha confirma manualmente se a condição foi batida | `sim` |

Quando `automatizavel=nao`, o Gerente IA menciona o prêmio como pendente de confirmação humana em vez de tentar calcular algo que não tem como saber.

## Equipe

Quem está "na loja" é definido por `vendedores.json` (cadastrado pela Área Adm, aba "Vendedores"), campo `ativo` — não mais por ter linha em `vendas.csv`. `vendas.csv` continua sendo só o histórico de vendas de cada um, ligado ao perfil por nome (ou por `nomesAnteriores`, se a pessoa foi renomeada no cadastro).

O Gerente IA relê estes arquivos automaticamente antes de qualquer análise ou relatório, e sempre recalcula do zero — nunca reaproveita um número de uma resposta anterior.
