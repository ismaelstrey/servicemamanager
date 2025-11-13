## Objetivo
- Garantir que apenas um loader seja exibido por vez, usando o componente com `logo.svg` (LogoLoader), removendo sobreposições de loaders simultâneos.

## Diagnóstico Rápido
- App-level:
  - `src/App.tsx`: ProtectedRoute/PublicRoute rendem uma tela "Carregando..." (div) e o `Suspense` usa um fallback "Carregando...". Esses dois podem aparecer simultaneamente.
  - `src/components/auth/ProtectedRoute.tsx`: exibe `<Spinner />` durante `loading` do `useAuth`.
- Page-level:
  - `src/pages/reports/ReportsPage.tsx`: já usa `LogoLoader` (bom manter).
  - `src/pages/dashboard.tsx` e widgets como `RecentTickets`: usam `<Spinner />` local (ok para seções, não full-screen).

## Estratégia
1. Padronizar todos os loaders full-screen (auth e lazy-loading) para `LogoLoader` com `fullscreen`.
2. Evitar duplicidade entre `Suspense fallback` e loaders de rotas protegidas, usando sempre o mesmo componente e reduzindo a redundância.
3. Manter spinners locais apenas para estados de componentes/seções (sem overlay global).

## Implementação
1. `src/App.tsx`:
   - Substituir telas inline "Carregando..." em `ProtectedRoute` e `PublicRoute` por `<LogoLoader fullscreen message="Verificando autenticação..." />`.
   - Trocar `Suspense fallback` por `<LogoLoader fullscreen message="Carregando..." />`.
2. `src/components/auth/ProtectedRoute.tsx`:
   - Substituir `<Spinner />` por `<LogoLoader fullscreen message="Verificando autenticação..." />`.
3. Revisão de páginas:
   - Manter `LogoLoader` full-screen apenas onde já existe (ex.: `ReportsPage`).
   - Em páginas que usam `Spinner` para conteúdo interno (ex.: `dashboard.tsx`, widgets), manter como spinners seccionais (sem overlay full-screen). Se houver overlay full-screen, trocar por `LogoLoader` ou remover.

## Verificação
- Navegar para rotas públicas e protegidas com `isLoading` (Auth em estado de verificação): deve aparecer apenas `LogoLoader`.
- Simular lazy loading de páginas: `Suspense` deve renderizar apenas `LogoLoader`.
- Acessar `ReportsPage`: o loader com logo aparece quando `loading` true; nenhum outro overlay simultâneo.
- Conferir que componentes seccionais (cards/listas) mostram spinner apenas dentro da seção, sem sobrepor `LogoLoader`.

## Arquivos Alvo
- `src/App.tsx` (fallback e Protected/Public routes)
- `src/components/auth/ProtectedRoute.tsx` (loader do auth)
- (opcional) páginas com overlay global, caso existam fora dos alvos acima

## Observações
- `LogoLoader` suporta variantes (`spinner`, `pulse`) e `fullscreen`: usaremos `fullscreen` para overlays globais.
- Manter mensagens curtas e consistentes com o tema.

Confirma aplicar essas alterações para unificar todos os loaders full-screen no `LogoLoader` e remover duplicidades?