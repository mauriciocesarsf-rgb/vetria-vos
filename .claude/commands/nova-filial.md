---
name: vetria:nova-filial
description: Cria uma nova empresa/filial duplicando a identidade de marca de uma empresa já cadastrada (franquia, rede ou negócio próprio com mais de uma unidade), sem repetir a implantação do zero.
allowed-tools: Read, Write, Glob
model: sonnet
---

# Nova Filial

Cria uma unidade nova reaproveitando o que é da marca (identidade visual, posicionamento, tom de voz) e pedindo de novo só o que é específico da unidade (endereço, equipe, redes sociais). Nunca copia dados de vendas — cada filial começa com indicadores zerados.

## Passo 1. Listar empresas existentes

Liste as pastas em `minhas-empresas/` (exceto arquivos como `.ativa` e `README.md`). Se não houver nenhuma, informe que é preciso ativar a primeira empresa normalmente (fluxo padrão do CLAUDE.md) antes de criar uma filial, e encerre.

```
Você tem estas empresas cadastradas:

1. {nome da empresa 1} ({slug})
2. {nome da empresa 2} ({slug})
...

Qual delas é a matriz/rede que a nova filial deve seguir?
```

## Passo 2. Dados da nova filial

Pergunte, uma de cada vez:
1. Nome desta unidade (ex: "Santa Lolla Praia do Canto").
2. Endereço completo.
3. Redes sociais e site desta unidade (se forem diferentes da matriz — algumas redes são por unidade, outras são só da marca nacional).
4. Segmento é o mesmo da empresa de origem? (Se sim, reaproveita. Se não, pergunte o novo.)

Não pergunte de novo: missão, visão, valores, posicionamento, identidade visual, tom de comunicação — isso vem da empresa de origem (Passo 3).

## Passo 3. Criar a estrutura

Gere um slug em kebab-case a partir do nome novo. Crie:

```
minhas-empresas/{slug-novo}/
├── dna/
│   ├── workbook-dna.md
│   ├── identidade-visual/     (copiado da origem)
│   └── indicadores/           (vazio, a partir dos templates)
├── memoria/                   (vazio)
└── entregas/                  (vazio)
```

1. Copie `minhas-empresas/{slug-origem}/dna/identidade-visual/` inteira para `minhas-empresas/{slug-novo}/dna/identidade-visual/`.
2. Copie `templates/vendas-indicadores.csv`, `templates/corridas.csv`, `templates/premios-especiais.csv`, `templates/meta-mensal-loja.csv` (só cabeçalho) e `templates/COMO-PREENCHER-indicadores.md` para `minhas-empresas/{slug-novo}/dna/indicadores/`. Nunca copie os arquivos de indicadores da origem — cada filial começa zerada.
3. Copie `templates/problemas-conhecidos.md` (vazio) para `minhas-empresas/{slug-novo}/dna/problemas-conhecidos.md`. Se a origem tiver problemas registrados cujo responsável é a franqueadora/rede (não a loja específica), esses provavelmente afetam a nova unidade também — pergunte ao usuário se quer copiá-los.
4. Monte `minhas-empresas/{slug-novo}/dna/workbook-dna.md`:
   - **Copie exatamente da origem** (sem reescrever): Missão (2), Visão (3), Valores (4), Posicionamento (5), Tom de comunicação (9), Identidade visual (10).
   - **Preencha com o que foi respondido no Passo 2**: Dados básicos (1), Equipe e objetivo atual (11) fica em branco (pergunte depois ou deixe pendente).
   - **Deixe em branco para responder depois**: Diferenciais (6) e Público principal (7) — são específicos de cada unidade, não herdam da matriz.
   - **Etapa 13 (Franquia/Rede)**: registre "Esta unidade faz parte da mesma rede de: {nome da origem} ({slug-origem})." Edite também a Etapa 13 da empresa de origem, adicionando a nova filial na lista de unidades irmãs — isso é o que permite comparações entre lojas depois.
5. Gere o painel personalizado (ver CLAUDE.md, seção "PAINEL PERSONALIZADO") para a filial nova, reaproveitando `{{COR_DESTAQUE}}` da origem.

## Passo 4. Confirmar e ativar

```
Filial criada: {nome} ({slug-novo}).

Reaproveitado da matriz: missão, visão, valores, posicionamento, identidade visual, tom de comunicação.
Zerado para esta unidade: vendas, corridas, equipe, diferenciais, público.

Quer ativar esta filial agora (escrever em minhas-empresas/.ativa) ou continuar na empresa atual?
```

## Sobre comparar filiais entre si

Quando o usuário pedir para comparar duas ou mais unidades da mesma rede (ex: "como a Praia do Canto está em relação à Shopping Vitória?"), o Gerente IA pode ler `minhas-empresas/{outro-slug}/dna/indicadores/` diretamente, desde que o usuário informe (ou já esteja registrado na Etapa 13 de cada uma) quais slugs são unidades irmãs. Não existe hoje uma visão consolidada automática de "rede inteira" — cada comparação é sob pedido, lendo os arquivos das unidades envolvidas. Se isso virar uma necessidade recorrente, vale criar um command dedicado de comparação entre filiais.
