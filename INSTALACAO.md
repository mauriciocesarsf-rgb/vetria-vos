# Instalação — Vetria VOS

Como colocar o Vetria pra rodar numa loja nova. Este documento é sobre **acesso** (onde abrir), não sobre uso — pra isso, ver [`MANUAL-DE-USO.md`](MANUAL-DE-USO.md).

## Pré-requisito obrigatório: conta Claude

O Vetria **não é um programa independente** — é um conjunto de instruções (`CLAUDE.md`, agents, commands) que só roda dentro do **Claude Code**, da Anthropic. Sem uma conta Claude com acesso ao Claude Code, não tem como usar o Vetria, de nenhuma forma.

Isso é um custo separado do cliente, não incluído no Vetria em si. Ao vender/implantar o Vetria pra um cliente novo, deixe isso explícito antes de qualquer coisa.

## Duas formas de abrir o projeto

### 1. Desktop (VS Code ou Cursor) — mais completo, testado nesta implantação

1. Instale o [Claude Code](https://claude.com/claude-code) (CLI) e a extensão no VS Code ou Cursor.
2. Clone o repositório `vetria-vos` (ou baixe a pasta) na máquina.
3. Abra a pasta no VS Code/Cursor.
4. O `CLAUDE.md` é lido automaticamente a cada conversa nova.

É o caminho usado até agora, o mais testado.

### 2. Celular / navegador puro — testado, **não funciona hoje**

Testamos ao vivo em 2026-08 (Android, Chrome): dentro de claude.ai, a seção "Código" (em Produtos, na barra lateral) leva pra `claude.ai/code`, mas essa página é só uma **divulgação do produto Claude Code**, com o comando de instalação do CLI (`curl -fsSL https://claude.ai/install.sh | bash`) — feito pra rodar num terminal de computador. Não existe uma sessão de código utilizável direto do navegador do celular.

**Conclusão prática: hoje não dá pra usar o Vetria só pelo celular, sem um computador rodando o Claude Code por trás.** Se isso for um requisito forte, as opções realistas são:
- **Acesso remoto** a um computador que já tem o Vetria instalado (app de área de trabalho remota tipo AnyDesk/TeamViewer) — funciona hoje, mas a experiência num celular é ruim (tela pequena, feita pra desktop).
- **App mobile dedicado** (chat + gerador de imagem, como cheguei a levantar antes) — construção separada e grande, fora da arquitetura atual de prompts.
- **Esperar o produto Claude Code evoluir** — a Anthropic pode lançar acesso web completo no futuro; vale reconferir essa página de tempos em tempos.

Por ora, todo uso do Vetria depende de um computador (desktop ou notebook) com VS Code/Cursor + Claude Code instalados.

## Pra quem revender o Vetria (contexto de produto)

Cada cliente novo precisa, além de receber o Vetria:
1. Ter (ou criar) a própria conta Claude com acesso ao Claude Code.
2. Ter um computador (desktop/notebook) com VS Code ou Cursor + Claude Code instalados — celular sozinho não é suficiente hoje (ver acima).
3. Preencher a Pasta DNA da empresa dele (ver `MANUAL-DE-USO.md`).

O empacotamento desktop (instalador tipo Fluxo Criativo, nos "próximos passos" do `README.md`) deixa o passo 1-2 mais simples de guiar, mas não remove a exigência da conta Claude — só facilita a instalação em volta dela.
