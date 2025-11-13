# Status do Frontend — TelecomAI

## Tecnologias
- React, TypeScript, Vite, react-router-dom, framer-motion
- Hooks para API, Context API, PWA
- Observação: alinhar gradualmente com Tailwind v4 conforme regras do projeto

## Fundamentos e Design System
- [x] Theme/tokens/breakpoints/mixins/globalStyles
- [x] Estrutura de pastas profissional (ui/composite/layout/forms/templates/pages)
- [x] ThemeProvider e sistema light/dark

## Hooks e Infra de Frontend
- [x] `useApi` com interceptors de autenticação
- [x] `useAuth` e `AuthContext`
- [x] Rotas protegidas (`ProtectedRoute`)

## UI — Atoms/Molecules/Organisms
- [x] Atoms: Button, Input, TextArea, Select, Checkbox, Radio, Switch, Label, Text, Heading, Icon, Avatar, Badge, Divider, Spinner
- [x] Molecules: InputGroup, SearchBox, ButtonGroup, Card, Modal, Tooltip, Popover, Dropdown, Tabs, Accordion, Breadcrumb, Pagination, ProgressBar, Alert, Toast
- [x] Organisms: Header, Sidebar, Navigation, DataTable básico, DataGrid, FormSection, StatsCard, ChartContainer, FilterPanel, SearchResults, CommentThread, FileUpload, Calendar, Timeline

## Templates e Layouts
- [x] AuthTemplate, DashboardTemplate, ListTemplate, DetailTemplate, FormTemplate, ErrorTemplate, EmptyStateTemplate
- [x] Sistema de layout responsivo e utilities (grid/flex/spacing)

## Autenticação (Páginas)
- [x] Login, Registro, Esqueci senha, Reset
- [x] Refresh token automático

## Dashboard
- [x] Cards de métricas com animações
- [x] Gráficos (Chart.js/Recharts) e filtros de período
- [x] Exportação de relatórios (parcial)
- [x] Notificações em tempo real

## Tickets
- [x] Lista com filtros avançados e busca
- [x] Visualizações: lista, grid, kanban
- [x] Detalhes com comentários e anexos drag-and-drop
- [x] Labels/tags e histórico

## Ordens de Serviço
- [x] Lista com múltiplas visualizações
- [x] Calendário de agendamentos
- [x] Formulário avançado
- [x] Qualificação (rating + feedback) e workflow de aprovação
- [ ] Integração com mapas
- [ ] Assinatura digital

## Perfil e Configurações
- [x] Perfil com edição inline e upload de avatar
- [x] Configurações de notificação
- [x] Preferências de tema e histórico de atividades
- [ ] 2FA

## Relatórios
- [x] Página `/reports` com visualizações e filtros
- [ ] Tabela e gráficos KPIs completos
- [ ] Exportação CSV/PDF/XLSX

## Gerência de Usuários (Admin)
- [x] Rotas: `/users`, `/users/new`, `/users/:id`
- [x] Lista com busca e paginação (DataTable)
- [x] Criar novo usuário
- [x] Editar usuário
- [x] Desativar/Ativar usuário
- [x] Alterar senha (administrativo)
- [x] Acesso pelo botão “Gerenciar Usuários” no `/dashboard`

## Clientes (Admin)
- [x] Página `/customers` com busca e paginação
- [ ] Cadastrar cliente (pendente backend)
- [ ] Editar cliente (pendente backend)

## Help Page
- [ ] Página `/help` consumindo `docs/help/*` via `useHelpDocs`
- [ ] Navegação por tópicos, busca e leitura de Markdown

## Acessibilidade e Performance
- [x] framer-motion e micro-interações
- [x] Code splitting, lazy loading, memoização
- [x] Virtual scrolling e image optimization
- [x] PWA com offline support
- [ ] Testes de acessibilidade e Storybook amplo

## Pendências Prioritárias
- [ ] DataTable completo (sorting/filtering/paginação integrados)
- [ ] Exportação em `/reports` (CSV/PDF/XLSX)
- [ ] HelpPage com leitura de Markdown
- [ ] 2FA e notificações do cliente
- [ ] Acessibilidade WCAG e testes
- [ ] Migração gradual para Tailwind v4 (CSS vars + componentes)

## Novas Implementações Sugeridas
- [ ] Componente `Table` com prop `stickyHeader`
- [ ] Storybook robusto e testes visuais
- [ ] RBAC visual nas rotas e páginas
- [ ] i18n e melhorias de acessibilidade
- [ ] Unificação de toolbars entre Tickets e ServiceOrders

## Progresso Atual
- Concluído: grande parte das páginas e componentes base
- Foco: DataTable, relatórios, HelpPage, acessibilidade e Tailwind v4
