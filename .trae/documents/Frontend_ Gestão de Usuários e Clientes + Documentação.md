## Objetivo
- Implementar no frontend: gestão completa de usuários (listar, criar, editar, desativar/ativar e alterar senha), página de clientes com listagem e busca, e navegação a partir de /dashboard.
- Atualizar `docs/frontendStatus.md` documentando as novas funcionalidades.

## Escopo Funcional
- Usuários (Admin):
  - Listar usuários com busca e paginação.
  - Criar novo usuário.
  - Editar dados do usuário.
  - Desativar/ativar usuário.
  - Alterar senha (fluxo administrativo).
  - Acesso direto via botão “Gerenciar Usuários” no /dashboard.
- Clientes (Admin):
  - Listar clientes com busca e paginação.
  - Preparar base para cadastrar/editar clientes (marcar como pendente se o backend não tiver endpoints de POST/PUT).

## Arquivos a Criar/Alterar
- Rotas:
  - `frontend/src/App.tsx`: adicionar rotas protegidas para `/users`, `/users/new`, `/users/:id` e `/customers`.
- Usuários:
  - `frontend/src/pages/users/UsersListPage.tsx`: evoluir para DataTable com ações (ver/editar, desativar/ativar, alterar senha), busca e paginação.
  - `frontend/src/pages/users/UserFormPage.tsx`: suportar modo criação e edição (carregar dados via `useUsers.getUser` quando houver `:id`), permitir alteração de senha.
  - (Opcional) `frontend/src/components/users/ChangePasswordModal.tsx`: modal simples para alteração de senha usando `useUsers.updateUser({ password })`.
  - `frontend/src/hooks/useUsers.ts`: garantir métodos já existentes (`listUsers`, `getUser`, `createUser`, `updateUser`, `disableUser`) e uso para alteração de senha.
- Clientes:
  - `frontend/src/pages/customers/CustomersListPage.tsx`: usar `useCustomers.searchCustomers` com busca e paginação; botão “Cadastrar Cliente” (desabilitado/pendente se não houver endpoint de criação).
  - (Opcional) `frontend/src/pages/customers/CustomerFormPage.tsx`: formulário base (pendente integração se backend não existir).
- Dashboard:
  - `frontend/src/pages/dashboard.tsx`: já possui `onManageUsers` → `/users`; validar funcionamento.

## UX e Componentes
- DataTable: usar `components/ui/DataTable.tsx` para tabela.
- Table: aproveitar `components/ui/Table.tsx` para estilos/variações.
- Inputs/Buttons: reutilizar atoms existentes.
- Navegação: `react-router-dom` com rotas protegidas já presentes.

## Integração com API
- Usuários: endpoints já previstos em `useUsers` (`/users`, `/users/:id`, `/users/:id/disable`). Alteração de senha via `updateUser(id, { password })`.
- Clientes: listar via `GET /customers`. Criação/edição marcadas como pendentes até existir suporte no backend.

## Documentação
- `docs/frontendStatus.md`: atualizar seções refletindo:
  - Gerência de Usuários (Admin): [x] listar, [x] criar, [x] editar, [x] desativar/ativar, [x] alterar senha, [x] acesso via dashboard.
  - Clientes (Admin): [x] listar com busca/paginação; [ ] cadastrar; [ ] editar (pendente backend).

## Critérios de Aceite
- `/dashboard` → botão “Gerenciar Usuários” navega para `/users` com lista funcional.
- `/users/new` cria usuário; `/users/:id` edita; alteração de senha disponível.
- `/customers` lista clientes com busca/paginação.
- Documentação atualizada no `frontendStatus.md`.

## Entregáveis
- Código das páginas e rotas atualizados.
- Documentação em `docs/frontendStatus.md` com status e pendências.

## Observações
- Manter TypeScript estrito e camelCase.
- Reutilizar hooks e UI existentes.
- Evitar dependências novas; focar em integração com estrutura atual.