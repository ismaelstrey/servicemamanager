import React, { useEffect, useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Input, Button, Alert } from '../../components/ui';
import type { CustomerListItem } from '../../services/customerService';

export function CustomersListPage(): React.ReactElement {
  const { searchCustomers } = useCustomers();
  const [items, setItems] = useState<CustomerListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const load = async () => {
    try {
      setError(null);
      const res = await searchCustomers(search, page, limit);
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      setError('Falha ao carregar clientes');
    }
  };

  useEffect(() => { load(); }, [page, limit]);

  const columns: Column<CustomerListItem>[] = [
    { key: 'id', header: 'ID', width: 80 },
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'Email', width: 260 },
    { key: 'phone', header: 'Telefone', width: 160 },
    { key: 'document', header: 'Documento', width: 180 },
  ];

  return (
    <div className="p-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-gray-600">Lista de clientes com busca e paginação.</p>
        </div>
        <Button variant="secondary" disabled>
          Cadastrar Cliente (pendente backend)
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Input placeholder="Buscar clientes" value={search} onChange={(e: any) => setSearch(e.target.value)} />
        <Button onClick={() => { setPage(1); load(); }}>Buscar</Button>
      </div>

      {error && <Alert variant="danger" title="Erro">{error}</Alert>}

      <DataTable columns={columns} data={items} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <span className="text-sm text-gray-600">Página {page} de {Math.max(1, Math.ceil(total / limit))}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</Button>
          <Button variant="secondary" onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / limit)}>Próxima</Button>
        </div>
        <select className="border p-2 rounded" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}

export default CustomersListPage;
