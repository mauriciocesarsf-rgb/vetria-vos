# Arquitetura do VOS. Guia Técnico

Como o projeto `vetria-vos` está estruturado e como adicionar um novo agent, skill ou command. Escrito para ser lido por humanos e por LLMs que precisem manter ou expandir o projeto.

## Componentes

| Componente | Local | Papel |
|---|---|---|
| **CLAUDE.md** | raiz | Constituição da Vetria: identidade, valores, regras globais, tabela de roteamento entre especialistas. Lido em toda conversa. |
| **Agents** | `.claude/agents/*.md` | Especialistas digitais autônomos. Recebem a tarefa, leem a Pasta DNA da empresa ativa e a própria memória, executam e entregam o resultado. |
| **Skills** | `.claude/skills/{nome}/SKILL.md` | Base de conhecimento (metodologia, frameworks, referências) consultada pelos agents. Não é acionada diretamente pelo usuário. |
| **Commands** | `.claude/commands/*.md` | Slash commands interativos para fluxos recorrentes de um especialista. Ainda não existem nesta fase. |

## Adicionar um novo agent (especialista)

1. Crie `.claude/agents/{nome-kebab-case}.md`.
2. Frontmatter obrigatório:
   ```yaml
   ---
   name: nome-do-agente
   description: O que o agente faz e quando acioná-lo (aparece na listagem).
   tools: Read, Write, Edit, Glob
   model: claude-sonnet-4-6
   ---
   ```
3. Inclua sempre, nesta ordem:
   - **Passo 0. Memória do agente** — ler `.claude/agents-memory/{nome}.md` (global) e `minhas-empresas/{ativa}/memoria/{nome}.md` (por empresa); atualizar as duas ao final.
   - **Passo 0.5. Contexto operacional (Pasta DNA)** — verificar `minhas-empresas/{ativa}/dna/`, solicitar se ausente, nunca inventar informação sobre a empresa.
   - Identidade, objetivo, integração com os outros especialistas (quando encaminhar).
   - Como pensa, especialidades, o que entrega.
   - Onde salvar: `minhas-empresas/{ativa}/entregas/{area}/[arquivo].md`.
   - Regras de comportamento e princípio fundamental ("não substitui, potencializa").
4. Registre o agente na tabela "OS ESPECIALISTAS DIGITAIS" do `CLAUDE.md` e na tabela de especialistas do `README.md`.

## Adicionar uma nova skill

Use quando um agent começar a carregar conhecimento extenso (frameworks, listas, referências) que vale a pena extrair para reaproveitar entre agents.

1. Crie `.claude/skills/{nome-kebab-case}/SKILL.md`.
2. Frontmatter: `name` (kebab-case) e `description` (inclua palavras-chave de ativação e quais agents consultam essa skill).
3. Conteúdo é conhecimento de referência, não fluxo de trabalho — isso mora no agent.
4. No agent que usa a skill, referencie explicitamente: "Antes de gerar, leia `.claude/skills/{nome}/SKILL.md`." Skills não são carregadas automaticamente.

## Adicionar um novo command

Use para um fluxo curto e recorrente que não precisa da autonomia completa de um agent.

1. Crie `.claude/commands/{nome}.md` com frontmatter `name` e `description`.
2. Siga o padrão de UX: contexto (ler Pasta DNA da empresa ativa) → entrevista (uma pergunta por vez) → confirmação (resumo + aprovação) → geração → entrega (salvar + indicar caminho).

## settings.json. Permissões

`.claude/settings.json` controla o que o Claude Code pode fazer sem pedir confirmação. Padrão atual: leitura/escrita em `minhas-empresas/`, leitura de `.claude/agents`, `.claude/skills`, `.claude/commands`, leitura/escrita da memória global em `.claude/agents-memory/`.

Para uma nova integração externa que precise rodar comandos, adicione `"Bash(ferramenta *)"` ao array `allow`.

## O que sobe para o git

**Sobe:** `.claude/agents/`, `.claude/skills/`, `.claude/commands/`, `.claude/settings.json`, `CLAUDE.md`, `README.md`, `ARQUITETURA.md`, `templates/`, `painel/` (template e assets, não os painéis gerados por empresa).

**Não sobe** (protegido pelo `.gitignore`): `minhas-empresas/` (dados das empresas clientes), `.claude/agents-memory/` (memória acumulada), `.claude/settings.local.json`.
