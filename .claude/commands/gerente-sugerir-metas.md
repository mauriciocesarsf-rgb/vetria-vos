---
name: vetria:gerente-sugerir-metas
description: Sugere como dividir a meta do mês entre os dias, a partir do histórico de vendas e das datas e ações do mês, e deixa como rascunho para o gestor revisar e aprovar na aba Meta por dia da Área Adm.
allowed-tools: Read, Write, Edit, Bash
model: sonnet
---

# Sugerir metas por dia

Monta uma sugestão de quanto cada dia pesa na meta do mês, olhando como a loja vendeu em meses anteriores e as datas e ações do mês. É sempre só uma sugestão: nada vale até o gestor aprovar na aba "Meta por dia" da Área Adm. Nunca aprove nem ajuste os pesos por conta própria, e nunca invente um padrão ou um tamanho de efeito que o histórico ou a própria pessoa não mostraram.

## Passo 0. Definir o mês

Se o pedido trouxe um mês no formato AAAA-MM (é o caso quando vem do botão da tela), use esse sem perguntar nada. Sem mês explícito, use o mês seguinte ao mês corrente, e se estiver numa conversa de chat, confirme o mês em uma frase antes de continuar.

Leia `minhas-empresas/.ativa` para saber a empresa.

## Passo 1. Montar as datas e ações do mês

Leia, se existirem:
- `dna/indicadores/config-metas.md`, seção "Datas e ações que mexem nas vendas" (ignore se ainda estiver só com o texto de exemplo entre parênteses).
- `dna/marketing/calendario-{AAAA-MM}.md` do mês escolhido.

Monte uma lista com no máximo 8 itens. Cada item tem `inicio` (AAAA-MM-DD), `fim` (opcional, mesmo formato), `motivo` (curto, em português, do jeito que a pessoa reconheceria) e `origem`:

- **`"origem": "gestor"` com `"fator"`:** só quando a PESSOA disse, em `config-metas.md`, o tamanho do efeito de forma clara (ex: "dobra" vira 2, "30% a mais" vira 1.3). Converta o período descrito em datas do mês escolhido. Nunca invente um fator, e nunca transforme frases vagas ("é o maior mês do ano", "vende bem") em número.
- **`"origem": "data"` (sem fator):** para uma data ou ação que a pessoa citou sem dizer o tamanho do efeito, e para datas do calendário de marketing que são datas conhecidas de venda no varejo de moda (ex: Dia das Mães, Dia dos Namorados, Dia dos Pais, Dia das Crianças, Dia do Cliente, Black Friday, Natal). O programa decide sozinho se o histórico do ano passado confirma, se vale um palpite pequeno ou se não há ajuste.
- **Fora da lista:** dias de "Ritmo semanal", pauta de conteúdo (Outubro Rosa, tendências, Halloween), os feriados em si (a Vetria não sabe se a loja fecha) e qualquer data que você não consiga ligar a venda. Na dúvida, deixe de fora.
- Se a frase da pessoa for ambígua sobre o período (ex: "última semana de novembro"), ou se uma data do calendário cair dentro de um feriadão ou de vários dias seguidos, use a leitura mais literal (o dia exato da data) e diga na mensagem final quais dias você considerou, para a pessoa poder corrigir na tela.

Sem nada para considerar, siga sem a lista.

Com itens, grave a lista como uma lista de objetos em JSON em `minhas-empresas/{ativa}/entregas/gestao/ajustes-pesos-{AAAA-MM}.json`, usando a ferramenta de escrita. Exemplo do formato:

```json
[
  { "inicio": "2026-10-26", "fim": "2026-10-31", "motivo": "Ação parecida com a Black", "origem": "gestor", "fator": 2 },
  { "inicio": "2026-10-12", "motivo": "Dia das Crianças", "origem": "data" }
]
```

## Passo 2. Gerar a sugestão

Rode, trocando AAAA-MM pelo mês escolhido:

```bash
node .claude/skills/gerente-metas/sugerir-pesos.js AAAA-MM
```

Se montou a lista no Passo 1, acrescente `--ajustes minhas-empresas/{ativa}/entregas/gestao/ajustes-pesos-{AAAA-MM}.json` ao final. Só acrescente também `--refazer` se a pessoa pediu claramente para substituir pesos já aprovados daquele mês. A conta é feita inteira por esse programa: não recalcule, não ajuste e não arredonde nenhum peso por conta própria.

Depois de rodar, apague a lista do Passo 1 (`rm` no caminho dela), tenha dado certo ou não.

O resultado vem em formato de dados, com um campo `status`:

- **`erro`:** conte em uma frase o que a mensagem diz, sem mostrar o formato técnico. Não tente consertar por outro caminho.
- **`ja_aprovado`:** o mês já tem pesos aprovados e nada foi alterado. Avise isso, explique que uma nova sugestão troca os pesos atuais por um rascunho (e os relatórios voltam a usar dias iguais até a pessoa aprovar de novo) e pergunte se quer mesmo substituir. Só rode de novo com `--refazer` se a resposta for sim.
- **`ok`:** siga para o Passo 3.

## Passo 3. Contar o resultado

Leia o arquivo indicado em `arquivo_explicacao` e resuma em até 8 frases curtas (a frase final com o aviso de rascunho conta à parte), em português simples, sem repetir tudo o que a explicação já diz na tela:
- No que a sugestão se baseou: quantos meses de histórico (ou que ainda não há histórico suficiente e os dias ficaram iguais).
- Os dias da semana que mais e menos pesam, quando houver padrão medido, com a porcentagem.
- O aviso de que histórico curto é uma indicação fraca, quando a explicação trouxer.
- Se a explicação trouxer o trecho "Datas e ações consideradas", diga quais datas entraram e de que tipo: informadas pela pessoa, confirmadas pelo histórico, ou palpite pequeno sem histórico (deixe claro que palpite não é confirmado). Sobre o que ficou de fora, diga em uma frase só que as demais datas do calendário de marketing (pauta de conteúdo) não entraram, sem listar uma por uma.
- Se a explicação trouxer o trecho "Você me contou", diga em uma frase se os números confirmam ou divergem do que a pessoa disse sobre os dias fortes e fracos.
- Que feriados em que a loja fecha não são conhecidos e se ajustam na tela.

Termine dizendo que é um rascunho e onde revisar: "Abra a aba Meta por dia na Área Adm, ajuste o que quiser e aprove."

Nunca use as palavras arquivo, programa, dados, csv ou formato técnico com a pessoa.

## Passo 4. Registrar

Anexe uma linha nova ao final de `entregas/registro-atividades.md`, seguindo o formato da seção "REGISTRO DE ATIVIDADES" do CLAUDE.md, com a data de hoje, o especialista "Gerente IA", o título "Sugestão de pesos da meta de {mês por extenso}/{ano}", o link para `dna/indicadores/pesos-{AAAA-MM}-explicacao.md` e status **pendente validação**. Use `Read` e `Edit`, nunca `Write` nesse arquivo.

## Passo 5. Modo automático

Só vale quando o pedido disser que o comando está rodando de forma automática e agendada (sem ninguém para responder). Nesse modo:

- O mês já vem informado: não pergunte nada. Pule o Passo 4 (registro de atividades): a área de trabalho do robô é temporária e o registro se perderia.
- A sugestão gerada ali também some, e não chega à tela da Área Adm (a sincronização só vai da loja para o robô). Por isso a mensagem é o único resultado: no lugar da frase final do Passo 3 ("Abra a aba Meta por dia na Área Adm..."), termine com: "É um rascunho: nada vale até você aprovar. Para revisar e aprovar, abra o app da Vetria, vá na Área Adm, aba Meta por dia, escolha {mês por extenso} e clique em Pedir sugestão da Vetria. Ele monta a mesma sugestão na tela, e aí você ajusta e aprova." (uma vez só, sem repetir a orientação).
- Envie essa mensagem em texto puro, sem imagem, pro gestor: leia `GERENTE_CANAL_RELATORIO` do `.env` e use exatamente o envio "sem imagem" de `/gerente-enviar-relatorio` (Passo 6), trocando o destino. Telegram: `TELEGRAM_CHAT_ID_GERENTE`, e se estiver vazio, `TELEGRAM_CHAT_ID_GRUPO`. WhatsApp: `GERENTE_WHATSAPP_DESTINO_GERENTE`, e se estiver vazio, `GERENTE_WHATSAPP_DESTINO_GRUPO`. Nunca escreva token ou chave no chat.
- Se o resultado do Passo 2 for `erro` ou `ja_aprovado`, não envie nada e termine explicando o motivo.
