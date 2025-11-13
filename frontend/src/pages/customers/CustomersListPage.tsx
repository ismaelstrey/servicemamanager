import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useCustomers } from '../../hooks/useCustomers';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button, Alert, Pagination, Select, SearchBox } from '../../components/ui';
import ListTemplate from '../../components/templates/ListTemplate/ListTemplate';
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

  const FooterRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
  `;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  return (
    <ListTemplate
      heading="Clientes"
      actions={(<Button variant="secondary" disabled>Cadastrar Cliente (pendente backend)</Button>)}
      toolbar={(
        <SearchBox
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          onSearch={() => { setPage(1); load(); }}
          onClear={() => { setSearch(''); setPage(1); load(); }}
          placeholder="Buscar clientes"
        />
      )}
      footer={(
        <FooterRow>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p: number) => setPage(p)} />
          <Select label="Itens por página" value={String(limit)} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
        </FooterRow>
      )}
    >
      {error && <Alert variant="danger" title="Erro">{error}</Alert>}
      <DataTable columns={columns} data={items} />
    </ListTemplate>
  );
}

export default CustomersListPage;
