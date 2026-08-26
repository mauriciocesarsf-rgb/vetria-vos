---
name: vetria:gerente-resolver-problema
description: Recebe um problema operacional, verifica se já é conhecido, classifica como interno ou dependente de terceiro, pesquisa em fontes confiáveis se necessário, e propõe solução (definitiva se interno, paliativa + encaminhamento se externo).
allowed-tools: Read, Write, WebSearch
model: sonnet
---

# Gerente IA. Resolver Problema

Executa a triagem completa de um problema operacional trazido pelo usuário.

## Passo 1. Entender o problema

Se o usuário já descreveu o problema ao chamar este comando, use essa descrição. Senão, pergunte:
```
Qual é o problema?
```

## Passo 2. Verificar se já é conhecido

Leia `minhas-empresas/.ativa`. Leia `minhas-empresas/{ativa}/dna/problemas-conhecidos.md`.

Se o problema já está registrado (mesmo que com outras palavras — reconheça a mesma causa raiz): mostre a solução já documentada (paliativa e/ou definitiva, status atual) e pergunte se mudou algo desde então. Se nada mudou, encerre aqui — não repita pesquisa.

## Passo 3. Classificar

```
Isso é algo que a loja resolve sozinha, ou depende de outra parte (franqueadora, fornecedor, sistema, prestador de serviço)?
```

Se o usuário não souber, analise com base no Workbook DNA (`dna/workbook-dna.docx`) e no bom senso: problemas de produto, identidade visual ou processos centrais de uma franquia costumam depender da franqueadora; problemas de atendimento, organização da loja, ou processo interno costumam ser resolvidos pela própria unidade.

## Passo 4. Verificar contra o Workbook DNA

Leia `dna/workbook-dna.docx`. Nunca proponha uma solução que contradiga o que está definido lá (identidade visual, posicionamento, regras de franquia). Se a solução depender de algo que só a franqueadora pode mudar, isso reforça que o problema é externo (Passo 3).

## Passo 5. Pesquisar se necessário

Se for um problema operacional genérico (não uma regra interna da empresa) e a solução não for óbvia, use `WebSearch` em fontes confiáveis — sites oficiais, associações do setor de moda/varejo, veículos reconhecidos. Nunca conteúdo duvidoso. Sempre cite a fonte na resposta. Nunca pesquise para decidir algo que o Workbook DNA já define.

## Passo 6. Propor a solução

**Se interno:** proponha a solução prática diretamente, com passos claros.

**Se externo:**
- Diga claramente quem é o responsável pela solução definitiva e como a loja deve acionar essa parte (abrir chamado, avisar suporte, etc.).
- Proponha uma solução paliativa concreta para usar até a definitiva chegar. Nunca deixe o problema sem nenhuma mitigação só porque não está nas mãos da loja.

## Passo 7. Registrar

Atualize ou crie a entrada em `dna/problemas-conhecidos.md`, seguindo a estrutura do template (nome, tipo, responsável, status, solução paliativa, solução definitiva, data, fonte). Informe ao usuário que ficou registrado, para reconhecimento rápido da próxima vez.
