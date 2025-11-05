import React from 'react';
import { useUsers } from '../../hooks/useUsers';

// Página de Usuários (/users): lista e ações básicas.
export function UsersListPage(): React.ReactElement {
  const { listUsers } = useUsers();

  const handleLoad = async () => {
    try {
      const res = await listUsers();
      console.log('Usuários:', res);
    } catch (err) {
      console.error('Erro ao listar usuários', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Usuários</h1>
      <p className="text-sm text-gray-600 mb-4">Gerencie usuários, perfis e permissões.</p>
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleLoad}>
        Carregar usuários
      </button>
    </div>
  );
}

export default UsersListPage;