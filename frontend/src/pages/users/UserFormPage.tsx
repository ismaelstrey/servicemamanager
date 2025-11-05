import React, { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import type { CreateUserInput } from '../../hooks/useUsers';

// Página de formulário de usuário (/users/new, /users/:id)
// Permite criar/editar com tipagem e validação simples (a implementar).
export function UserFormPage(): React.ReactElement {
  const { createUser } = useUsers();
  const [form, setForm] = useState<CreateUserInput>({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createUser(form);
      console.log('Usuário criado', res);
    } catch (err) {
      console.error('Falha ao criar usuário', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Novo Usuário</h1>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          className="border p-2 rounded"
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="px-4 py-2 bg-green-600 text-white rounded" type="submit">
          Salvar
        </button>
      </form>
    </div>
  );
}

export default UserFormPage;