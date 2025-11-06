// Hook para gerência de usuários: listar, obter, criar, atualizar e desativar.
// Garante tipagem e comentários em português para clareza.
import { ApiService } from '../services/api';

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
  const res = await ApiService.get<UserListItem[]>('/users');
  return res.data;
}

async function getUser(id: number): Promise<UserListItem> {
  const res = await ApiService.get<UserListItem>(`/users/${id}`);
  return res.data;
}

async function createUser(input: CreateUserInput): Promise<UserListItem> {
  const res = await ApiService.post<UserListItem>('/users', input);
  return res.data;
}

async function updateUser(id: number, input: UpdateUserInput): Promise<UserListItem> {
  const res = await ApiService.put<UserListItem>(`/users/${id}`, input);
  return res.data;
}

async function disableUser(id: number): Promise<UserListItem> {
  const res = await ApiService.post<UserListItem>(`/users/${id}/disable`);
  return res.data;
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