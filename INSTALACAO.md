# Instalação — Vetria VOS

Como colocar o Vetria pra rodar numa loja nova. Este documento é sobre **acesso** (como abrir e ativar), não sobre uso do dia a dia — pra isso, ver [`MANUAL-DE-USO.md`](MANUAL-DE-USO.md).

**Pra entregar pro cliente final**, use [`MANUAL-INSTALACAO-ILUSTRADO.html`](MANUAL-INSTALACAO-ILUSTRADO.html) — mesmo conteúdo deste documento, mas com print real de cada tela, pensado pra alguém completamente leigo em tecnologia seguir sozinho. Este arquivo (`INSTALACAO.md`) é a versão técnica, pra quem revende/implanta o Vetria.

> **Nota de versão:** desde a v1.0.4, a conexão com o Claude é feita dentro do próprio app (botão "Conectar minha conta Claude" na primeira tela) — não precisa mais abrir terminal nem rodar comando nenhum. Se você viu uma versão antiga deste documento pedindo pra rodar `claude` no terminal, ignore, esse passo não existe mais.

## Pré-requisito obrigatório: conta Claude

O Vetria roda por baixo dos panos usando o **Claude**, da Anthropic — o app cuida de tudo sozinho, mas **não cria nem paga a conta**. Sem uma conta Claude, o chat da Vetria não responde.

Isso é um custo separado do cliente, não incluído no Vetria em si. Ao implantar o Vetria pra um cliente novo, deixe isso explícito antes de qualquer coisa — se ele ainda não tiver conta, oriente a criar em [claude.com](https://claude.com) antes de instalar.

**Conectar a conta (uma vez só, por máquina):** na primeira abertura do Vetria, antes de qualquer conversa, o app mostra um botão "Conectar minha conta Claude". Clicar nele abre o navegador padrão pra fazer login; a tela do Vetria detecta sozinha quando terminou e libera o chat. Nenhum terminal, nenhum comando pra digitar.

## Instalar o Vetria (instalador único, Windows)

1. Baixe `Vetria-Setup-{versão}.exe` (ver a versão publicada em `dist/` deste repositório, ou o link que o backend disponibiliza).
2. Rode o instalador. Ele:
   - instala o **Git** e o **Node.js** automaticamente, se ainda não existirem na máquina;
   - baixa a versão mais recente do Vetria direto do repositório oficial pra Área de Trabalho;
   - cria o atalho **Vetria** na Área de Trabalho e no Menu Iniciar.
3. Abra o Vetria pelo atalho e conecte a conta Claude (ver acima).

Não precisa clonar repositório na mão, não precisa abrir VS Code, não precisa saber o que é terminal — isso tudo acontece dentro do instalador.

> **Ainda não existe versão para Mac.** O instalador só funciona em Windows por enquanto. Loja com Mac precisa esperar uma versão futura ou usar um computador Windows pra rodar o Vetria.

## Primeira ativação da loja

Depois de conectar a conta, a mesma tela vira uma conversa: o app pede pra você contar sobre a loja — nome, segmento — direto no chat, sem formulário. Com isso, ele já cria a pasta da empresa (com o Workbook DNA em `.docx` pra preencher) e o painel visual aparece.

A partir daí, a própria Vetria conduz o resto sozinha, pergunta por pergunta: canal de relatório (Telegram/WhatsApp, com passo a passo ilustrado dentro da conversa), vendedores, meta do mês, escala, calendário de conteúdo — até estar 100% configurada e entregar o primeiro raio-x da loja.

## Uso no dia a dia

Depois de ativada, o Vetria abre sempre no painel da loja: a constelação viva dos três especialistas, os indicadores do mês, e o campo de chat pra conversar com eles a qualquer momento. Ver `MANUAL-DE-USO.md` pros detalhes de cada especialista e comando.

## Pra quem revende o Vetria (contexto de produto)

Cada cliente novo precisa, além de receber o instalador:
1. Ter (ou criar) a própria conta Claude — conectada direto no app (ver acima), não precisa acontecer antes nem fora dele.
2. Ter um computador Windows (Mac ainda não é suportado).
3. Preencher a Pasta DNA da empresa dele durante a conversa inicial e ao longo do uso (ver `MANUAL-DE-USO.md`).

## Uso pelo celular

**Ainda não existe.** O Vetria hoje só roda como aplicativo de computador (Windows). Não há versão mobile nem acesso via navegador de celular. Se isso for um requisito forte do cliente, hoje a única saída é acesso remoto a um computador que já tem o Vetria instalado (ex: AnyDesk, TeamViewer) — funciona, mas a experiência num celular é ruim, pensada pra tela de desktop. Uma versão mobile dedicada é uma possibilidade futura, não uma prioridade atual.
