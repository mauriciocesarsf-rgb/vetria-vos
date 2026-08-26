# Instalação — Vetria VOS

Como colocar o Vetria pra rodar numa loja nova. Este documento é sobre **acesso** (como abrir e ativar), não sobre uso do dia a dia — pra isso, ver [`MANUAL-DE-USO.md`](MANUAL-DE-USO.md).

> **Nota de versão:** este documento substitui a versão anterior, que descrevia o fluxo antigo (abrir a pasta manualmente no VS Code/Cursor). Hoje existe um instalador de verdade (`Vetria Setup 1.0.0.exe`) que faz a maior parte disso sozinho.

## Pré-requisito obrigatório: conta Claude com Claude Code

O Vetria roda por baixo dos panos usando o **Claude Code**, da Anthropic — o app instala o motor sozinho, mas **não cria nem paga a conta**. Sem uma conta Claude com acesso ao Claude Code, autenticada na máquina, o chat da Vetria não responde.

Isso é um custo separado do cliente, não incluído no Vetria em si. Ao implantar o Vetria pra um cliente novo, deixe isso explícito antes de qualquer coisa.

**Como autenticar (uma vez só, por máquina):**
1. Instale o Claude Code seguindo [claude.com/claude-code](https://claude.com/claude-code).
2. Rode `claude` uma vez no terminal e siga o login (abre o navegador, autentica com a conta Claude do cliente).
3. Pronto — essa sessão fica salva na máquina, e o Vetria reaproveita ela automaticamente. Não precisa repetir isso depois de instalar o Vetria, só precisa já estar feito antes de abrir o app.

## Instalar o Vetria (instalador único, Windows)

1. Baixe `Vetria Setup 1.0.0.exe`.
2. Rode o instalador. Ele:
   - instala o **Git** e o **Node.js** automaticamente, se ainda não existirem na máquina;
   - baixa a versão mais recente do Vetria direto do repositório oficial pra Área de Trabalho;
   - cria o atalho **Vetria** na Área de Trabalho e no Menu Iniciar.
3. Abra o Vetria pelo atalho.

Não precisa clonar repositório na mão, não precisa abrir VS Code, não precisa saber o que é terminal — isso tudo acontece dentro do instalador.

> **Ainda não existe versão para Mac.** O `Vetria Setup 1.0.0.exe` só instala em Windows por enquanto. Loja com Mac precisa esperar uma versão futura ou usar um computador Windows pra rodar o Vetria.

## Primeira ativação da loja

Na primeira vez que abre o Vetria (antes de qualquer loja cadastrada), o app pede pra você contar sobre a loja — nome, segmento — direto numa conversa, sem formulário. Com isso, ele já cria a pasta da empresa e o painel visual aparece.

## Uso no dia a dia

Depois de ativada, o Vetria abre sempre no painel da loja: a constelação viva dos três especialistas, os indicadores do mês, e o campo de chat pra conversar com eles a qualquer momento. Ver `MANUAL-DE-USO.md` pros detalhes de cada especialista e comando.

## Pra quem revende o Vetria (contexto de produto)

Cada cliente novo precisa, além de receber o instalador:
1. Ter (ou criar) a própria conta Claude com acesso ao Claude Code, autenticada na máquina (ver acima) — **isso não é feito pelo instalador**, precisa acontecer antes.
2. Ter um computador Windows (Mac ainda não é suportado).
3. Preencher a Pasta DNA da empresa dele durante a conversa inicial e ao longo do uso (ver `MANUAL-DE-USO.md`).

## Uso pelo celular

**Ainda não existe.** O Vetria hoje só roda como aplicativo de computador (Windows). Não há versão mobile nem acesso via navegador de celular. Se isso for um requisito forte do cliente, hoje a única saída é acesso remoto a um computador que já tem o Vetria instalado (ex: AnyDesk, TeamViewer) — funciona, mas a experiência num celular é ruim, pensada pra tela de desktop. Uma versão mobile dedicada é uma possibilidade futura, não uma prioridade atual.
