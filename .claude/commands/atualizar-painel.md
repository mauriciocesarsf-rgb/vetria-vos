---
name: vetria:atualizar-painel
description: Recalcula os blocos dinâmicos do painel (indicadores do mês, corridas vigentes, sugestão do dia) e regrava minhas-empresas/{ativa}/painel.html, sem repetir a ativação completa da empresa.
allowed-tools: Read, Write, Glob
model: sonnet
---

# Atualizar Painel

Atualiza a "foto do dia" do painel visual da empresa ativa, seguindo a seção "PAINEL PERSONALIZADO" do `CLAUDE.md`.

## Passo 1. Verificar

Leia `minhas-empresas/.ativa`. Sem empresa ativa, informe e pare.

Verifique se `minhas-empresas/{ativa}/painel.html` existe. Se não existir, informe que essa empresa ainda não tem painel gerado (a primeira geração acontece na ativação da empresa, não aqui) e pare.

## Passo 2. Preservar o que não muda

Leia o `painel.html` atual e reaproveite os valores já resolvidos de `{{NOME_EMPRESA}}`, `{{SEGMENTO}}`, `{{SLUG_EMPRESA}}`, `{{DATA_ATIVACAO}}` e `{{COR_DESTAQUE}}` — não regenere esses. Reconfira rapidamente (podem ter mudado desde a última geração):

- `{{WHATSAPP_BADGE}}`: releia `.env` (mesma lógica do CLAUDE.md).
- `{{PROGRESSO_DNA}}` / `{{PROGRESSO_PCT}}`: reconte os campos preenchidos do Workbook DNA.

## Passo 3. Recalcular os blocos dinâmicos

Siga a seção "PAINEL PERSONALIZADO" do `CLAUDE.md`, passos de `{{INDICADORES_BLOCO}}` e `{{CORRIDAS_BLOCO}}` — releia `dna/indicadores/` do zero, nunca reaproveite um número de memória. (`{{SUGESTAO_BLOCO}}` e `{{ATIVIDADE_BLOCO}}` não existem mais no template — ver "Onde foram parar..." no `CLAUDE.md`, seção PAINEL PERSONALIZADO.)

## Passo 4. Salvar

Leia `painel/template.html`, substitua todos os placeholders (os preservados/reconferidos do Passo 2 + os recalculados do Passo 3), salve em `minhas-empresas/{ativa}/painel.html`.

## Passo 5. Confirmar

Informe que o painel foi atualizado com os dados de hoje e o caminho do arquivo.
