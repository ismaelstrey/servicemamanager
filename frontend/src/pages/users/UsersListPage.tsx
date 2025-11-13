import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUsers, type UserListItem } from '../../hooks/useUsers';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button, Modal, Input, Pagination, Alert, SearchBox } from '../../components/ui';
import ListTemplate from '../../components/templates/ListTemplate/ListTemplate';

export function UsersListPage(): React.ReactElement {
  const navigate = useNavigate();
  const { listUsers, updateUser, disableUser } = useUsers();

  const [items, setItems] = useState<UserListItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');

  const load = async () => {
    try {
      setError(null);
      const data = await listUsers();
      const filtered = search.trim()
        ? data.filter((u) =>
          [u.name, u.email].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
        )
        : data;
      setTotalItems(filtered.length);
      const start = (page - 1) * limit;
      const end = start + limit;
      setItems(filtered.slice(start, end));
    } catch (err: any) {
      setError('Falha ao carregar usuários');
    }
  };

  useEffect(() => {
    load();
  }, [page, limit]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / limit)), [totalItems, limit]);

  const ActionsCell = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.xs};
  `;

  const columns: Column<UserListItem>[] = [
    { key: 'id', header: 'ID', width: 80 },
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'Email', width: 260 },
    { key: 'role', header: 'Perfil', width: 140, render: (r) => r.role || 'user' },
    { key: 'active', header: 'Status', width: 120, render: (r) => (r.active ? 'Ativo' : 'Inativo') },
    {
      key: 'actions',
      header: 'Ações',
      width: 300,
      render: (r) => (
        <ActionsCell>
          <Button variant="primary" size="sm" onClick={() => navigate(`/users/${r.id}`)}>Editar</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/users/${r.id}`)}>Visualizar</Button>
          <Button
            variant={r.active ? 'danger' : 'accent'}
            size="sm"
            onClick={async () => {
              try {
                await disableUser(r.id);
                await load();
              } catch (e) {
                setError('Falha ao alterar status do usuário');
              }
            }}
          >
            {r.active ? 'Desativar' : 'Ativar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedUserId(r.id);
              setNewPassword('');
              setPasswordModalOpen(true);
            }}
          >
            Alterar Senha
          </Button>
        </ActionsCell>
      ),
    },
  ];

  return (
    <ListTemplate
      heading="Usuários"
      actions={(
        <Button variant="primary" onClick={() => navigate('/users/new')}>Cadastrar Usuário</Button>
      )}
      toolbar={(
        <SearchBox
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          onSearch={() => { setPage(1); load(); }}
          onClear={() => { setSearch(''); setPage(1); load(); }}
          placeholder="Buscar por nome ou email"
        />
      )}
      footer={(
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p: number) => setPage(p)}
        />
      )}
    >
      {error && <Alert variant="danger" title="Erro">{error}</Alert>}
      <DataTable columns={columns} data={items} />

      <Modal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title="Alterar Senha">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Input type="password" placeholder="Nova senha" value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setPasswordModalOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!selectedUserId) return;
                try {
                  await updateUser(selectedUserId, { password: newPassword });
                  setPasswordModalOpen(false);
                  setSelectedUserId(null);
                } catch (e) {
                  setError('Falha ao alterar senha');
                }
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </ListTemplate>
  );
}

export default UsersListPage;
