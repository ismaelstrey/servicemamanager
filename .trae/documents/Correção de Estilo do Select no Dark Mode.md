## Problema
- No dark mode, o `Select` aparece com background claro e fonte clara, causando baixa legibilidade.

## Solução Proposta
- Ajustar o `StyledSelect` para aplicar cores específicas quando `variant="outlined"` no modo escuro, usando `theme.mode`.
- Definir `background-color` para `theme.colors.background.secondary` e manter `color: theme.colors.text.primary` no dark mode.
- Opcional: garantir `option` herde cor apropriada com um seletor simples (`StyledSelect option { background-color; color }`).

## Arquivo a editar
- `src/components/ui/Select.tsx`:
  - No bloco do `variant: 'outlined'`, trocar `background-color: transparent` por `background-color` condicional baseado em `theme.mode`.
  - Manter borda e transições existentes.

## Verificação
- Modo escuro: `Select` com background escuro e fonte clara.
- Modo claro: `Select` continua discreto com `outlined` transparente sobre header claro.

Aplicar agora?