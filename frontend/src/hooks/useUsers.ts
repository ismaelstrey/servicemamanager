// Hook para gerência de usuários: listar, obter, criar, atualizar e desativar.
// Garante tipagem e comentários em português para clareza.

const apiUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:4002';

export interface UserListItem {
  id: number;
  name: string;
  email: string;
  role?: 'admin' | 'manager' | 'user';
  active?: boolean;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'user';
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'manager' | 'user';
  active?: boolean;
}

async function listUsers(): Promise<UserListItem[]> {
  const res = await fetch(`${apiUrl}/api/users`);
  if (!res.ok) throw new Error('Falha ao listar usuários');
  return res.json();
}

async function getUser(id: number): Promise<UserListItem> {
  const res = await fetch(`${apiUrl}/api/users/${id}`);
  if (!res.ok) throw new Error('Falha ao obter usuário');
  return res.json();
}

async function createUser(input: CreateUserInput): Promise<UserListItem> {
  const res = await fetch(`${apiUrl}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Falha ao criar usuário');
  return res.json();
}

async function updateUser(id: number, input: UpdateUserInput): Promise<UserListItem> {
  const res = await fetch(`${apiUrl}/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Falha ao atualizar usuário');
  return res.json();
}

async function disableUser(id: number): Promise<UserListItem> {
  const res = await fetch(`${apiUrl}/api/users/${id}/disable`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Falha ao desativar usuário');
  return res.json();
}

export function useUsers() {
  return {
    listUsers,
    getUser,
    createUser,
    updateUser,
    disableUser,
  };
}