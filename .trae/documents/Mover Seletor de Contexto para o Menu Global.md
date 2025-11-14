## Objetivo
- Remover o seletor de "Contexto" do Dashboard e adicioná‑lo no cabeçalho global, à esquerda do menu de perfil, permitindo trocar o contexto em qualquer página.
- Garantir que a mudança de contexto atualize a página corrente (recarregue dados conforme o novo provider/global).

## Estado Atual
- Seletor local em `src/components/dashboard/DashboardHeader.tsx` (label "Contexto").
- Controle de contexto por estado local em `src/pages/dashboard.tsx` e persistência em `localStorage('selectedProviderId')`.
- Outras páginas e hooks leem `localStorage`, sem um provider global.

## Implementação
### 1) Criar contexto global de provider
- Arquivo: `src/contexts/providerContext.tsx`.
- Conteúdo: `selectedProviderId: number | null` (null = global), `setSelectedProviderId`, e `mode: 'global' | 'provider'` derivado.
- Inicialização: ler de `localStorage('selectedProviderId')` e normalizar.
- Persistência: ao alterar, salvar em `localStorage` e atualizar o contexto.
- Hook: `useProviderContext()` para consumir estado/alterador.

### 2) Envolver a aplicação com o provider
- Arquivo: `src/App.tsx` ou `src/components/layout/Layout.tsx` (onde for o root comum das páginas).
- Envolver rotas/páginas com `<ProviderContextProvider> ... </ProviderContextProvider>` para ficar acessível globalmente.

### 3) Adicionar seletor ao cabeçalho global
- Arquivo: `src/components/layout/Layout.tsx`.
- Inserir um pequeno `<Select>` (reusando `src/components/ui/Select.tsx`) à esquerda de `<ProfileMenu />` dentro de `RightActions`.
- Opções: `Visão Global` + lista de provedores.
- Fonte de provedores: criar hook `src/hooks/useProviders.ts` que chama `ProviderService.listProviders({ limit: 50 })` e retorna lista com loading/erro.
- `value`: `global` quando `selectedProviderId === null`, senão `String(selectedProviderId)`.
- `onChange`: chama `setSelectedProviderId(...)` do contexto.

### 4) Remover seletor do Dashboard
- Arquivo: `src/components/dashboard/DashboardHeader.tsx`.
- Remover o bloco `Select` de Contexto e ajustar layout para manter o "Período" e botões.
- Arquivo: `src/pages/dashboard.tsx`.
- Substituir o estado/handler local de provider por consumo de `useProviderContext()` e adicionar `useEffect` para refetch quando `selectedProviderId` mudar.

### 5) Atualizar páginas/hooks para reatividade por contexto
- Atualizar para usar `useProviderContext()` ao invés de ler `localStorage` diretamente:
  - `src/hooks/useTickets.ts`
  - `src/pages/service-orders/ServiceOrdersCalendarPage.tsx`
  - `src/pages/service-orders/ServiceOrdersKanbanPage.tsx`
- Em cada um, incluir `selectedProviderId` no array de dependências de efeitos/fetch para refazer as consultas ao mudar o contexto.

### 6) Compatibilidade com código existente
- Manter a gravação em `localStorage('selectedProviderId')` no provider global para compatibilidade com áreas que ainda não foram migradas.
- Opcional: emitir `window.dispatchEvent(new CustomEvent('provider-context-changed', { detail: { selectedProviderId } }))` para quem ainda escuta eventos; porém preferimos reatividade via contexto.

## Verificação
- Navegar pelo app e mudar o seletor no cabeçalho; confirmar que:
  - Dashboard atualiza KPIs/listas conforme o provider/global.
  - Páginas de Tickets e Ordens recarregam dados.
  - Seleção persiste após reload (via `localStorage`).

## Arquivos Envolvidos
- `src/components/dashboard/DashboardHeader.tsx`
- `src/pages/dashboard.tsx`
- `src/components/layout/Layout.tsx`
- `src/components/layout/ProfileMenu.tsx` (apenas para posicionamento ao lado)
- `src/components/ui/Select.tsx`
- `src/hooks/useProviders.ts` (novo)
- `src/contexts/providerContext.tsx` (novo)
- `src/hooks/useTickets.ts`, `src/pages/service-orders/ServiceOrdersCalendarPage.tsx`, `src/pages/service-orders/ServiceOrdersKanbanPage.tsx`

Confirma que devo aplicar o plano e realizar as alterações?