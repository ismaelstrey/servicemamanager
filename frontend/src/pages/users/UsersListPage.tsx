import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, type UserListItem } from '../../hooks/useUsers';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button, Modal, Input, Pagination, Alert } from '../../components/ui';

export function UsersListPage(): React.ReactElement {
  const navigate = useNavigate();
  const { listUsers, updateUser, disableUser } = useUsers();

  const [items, setItems] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listUsers();
      const filtered = search.trim()
        ? data.filter((u) =>
            [u.name, u.email].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
          )
        : data;
      const start = (page - 1) * limit;
      const end = start + limit;
      setItems(filtered.slice(start, end));
    } catch (err: any) {
      setError('Falha ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, limit]);

  const total = useMemo(() => items.length + ((page - 1) * limit), [items, page, limit]);

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
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="primary" size="sm" onClick={() => navigate(`/users/${r.id}`)}>Editar</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/users/${r.id}`)}>Visualizar</Button>
          <Button
            variant={r.active ? 'danger' : 'success'}
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
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 className="text-2xl font-semibold">Usuários</h1>
          <p className="text-sm text-gray-600">Gerencie usuários, perfis e permissões.</p>
        </div>
        <Button variant="success" onClick={() => navigate('/users/new')}>Cadastrar Usuário</Button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Input placeholder="Buscar por nome ou email" value={search} onChange={(e: any) => setSearch(e.target.value)} />
        <Button onClick={() => { setPage(1); load(); }}>Buscar</Button>
      </div>

      {error && <Alert variant="danger" title="Erro">{error}</Alert>}

      <DataTable columns={columns} data={items} style={{ marginTop: 8 }} />

      <div style={{ marginTop: 12 }}>
        <Pagination
          page={page as any}
          total={total as any}
          pageSize={limit as any}
          onPageChange={(p: number) => setPage(p)}
          onPageSizeChange={(s: number) => { setLimit(s); setPage(1); }}
        />
      </div>

      <Modal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title="Alterar Senha">
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
    </div>
  );
}

export default UsersListPage;
