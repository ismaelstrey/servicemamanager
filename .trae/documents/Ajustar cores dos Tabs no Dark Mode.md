## Problema
Nos Tabs da página de detalhes do ticket (Detalhes, Comentários, Anexos, Histórico), quando ativos no dark mode, o fundo fica claro (quase branco) e o texto cinza, gerando baixo contraste.

## Estratégia
Ajustar o componente base `Tabs` para ser ciente do dark mode e aplicar cores mais adequadas, sem mexer na página individual.

## Mudanças Propostas
- Arquivo: `src/components/ui/Tabs.tsx`
- `default` variant (padrão usado na página):
  - Ativo: usar fundo sutil em dark (`theme.colors.alpha.white[10]` ou `theme.colors.background.tertiary`) e texto `theme.colors.text.primary`.
  - Inativo: manter sem fundo, texto `theme.colors.text.secondary`.
  - Adicionar uma borda sutil `theme.colors.border.primary` no ativo para reforçar contraste.
- `pills` variant:
  - Inativo no dark: substituir `theme.colors.neutral[100]` por `theme.colors.alpha.white[10]` para evitar branco em dark.
  - Ativo: manter `theme.colors.primary.main` com `theme.colors.primary.contrast`.
- `underline` variant: manter, pois já usa `primary.main` na borda; reforçar texto ativo `text.primary`.

## Implementação (resumo de CSS)
- Em `TabButton`:
  - Default variant active:
    ```ts
    background-color: theme.mode === 'dark' ? theme.colors.alpha.white[10] : theme.colors.primary[50];
    color: theme.colors.text.primary;
    border: 1px solid theme.colors.border.primary;
    ```
  - Pills variant inactive (dark):
    ```ts
    background-color: theme.mode === 'dark' ? theme.colors.alpha.white[10] : theme.colors.neutral[100];
    color: theme.colors.text.secondary;
    ```

## Testes
- Navegar para `http://localhost:5173/tickets/315` com dark mode ativo.
- Alternar abas e verificar alto contraste (sem fundo branco) e cores corretas no ativo/inativo.
- Checar em light mode para assegurar que a mudança não degrada a experiência.

## Observações
- Ajuste global, beneficiando todas as páginas que usam Tabs.
- Sem impacto em acessibilidade; mantém foco/aria corretamente.