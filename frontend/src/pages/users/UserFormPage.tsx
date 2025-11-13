import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsers, type CreateUserInput, type UpdateUserInput, type UserListItem } from '../../hooks/useUsers';
import { Input, Button, Alert } from '../../components/ui';

export function UserFormPage(): React.ReactElement {
  const navigate = useNavigate();
  const params = useParams();
  const idParam = params.id ? Number(params.id) : null;
  const isEdit = !!idParam;

  const { createUser, getUser, updateUser } = useUsers();
  const [form, setForm] = useState<CreateUserInput>({ name: '', email: '', password: '' });
  const [role, setRole] = useState<'admin' | 'manager' | 'user'>('user');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      if (!isEdit || !idParam) return;
      try {
        setLoading(true);
        const u: UserListItem = await getUser(idParam);
        setForm({ name: u.name, email: u.email, password: '' });
        setRole((u.role as any) || 'user');
      } catch (e) {
        setError('Falha ao carregar usuário');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEdit, idParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      if (isEdit && idParam) {
        const payload: UpdateUserInput = { name: form.name, email: form.email, role };
        if (form.password && form.password.trim().length > 0) {
          payload.password = form.password;
        }
        await updateUser(idParam, payload);
      } else {
        await createUser({ ...form, role });
      }
      navigate('/users');
    } catch (err) {
      setError('Falha ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h1>
      {error && <Alert variant="danger" title="Erro">{error}</Alert>}
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <Input placeholder="Nome" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} />
        <Input type="password" placeholder={isEdit ? 'Nova Senha (opcional)' : 'Senha'} value={form.password} onChange={(e: any) => setForm({ ...form, password: e.target.value })} />
        <select className="border p-2 rounded" value={role} onChange={(e) => setRole(e.target.value as any)}>
          <option value="user">Usuário</option>
          <option value="manager">Gestor</option>
          <option value="admin">Administrador</option>
        </select>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" type="button" onClick={() => navigate('/users')}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={loading}>Salvar</Button>
        </div>
      </form>
    </div>
  );
}

export default UserFormPage;
