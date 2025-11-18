## Objetivo
- Deixar o seletor de contexto no header mais discreto, sem rótulo visível.
- Adicionar um botão de criação de ticket ao lado do seletor no header.

## Mudanças Propostas
- `src/components/layout/Layout.tsx`:
  - Remover `label` do `Select` de contexto para ocultar a descrição.
  - Ajustar `size="sm"` e `variant="outlined"` para visual mais discreto.
  - Limitar largura do seletor (aprox. 160–180px) com um contêiner simples.
  - Adicionar `Button` "Criar Ticket" que navega para `/tickets/new` usando `useNavigate`.

## Comportamento
- Seletor continua trocando `selectedProviderId` no contexto global e atualiza a página atual automaticamente.
- Botão "Criar Ticket" acessível em qualquer página via header.

## Verificação
- Trocar contexto no header não mostra mais label, apenas o select compacto.
- Clicar em "Criar Ticket" leva para a página de novo ticket.

Posso aplicar as alterações agora?