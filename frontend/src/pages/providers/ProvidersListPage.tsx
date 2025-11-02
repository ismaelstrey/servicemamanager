import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Input, 
  Select,
  Badge,
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHeaderCell, 
  TableCell, 
  Pagination, 
  Spinner, 
  Alert 
} from '../../components/ui';
import { ApiService } from '../../services/api';
import type { ProviderListItem } from '../../services/providerService';

const DEFAULT_LIMIT = 10;

const ProvidersListPage: React.FC = () => {
  const navigate = useNavigate();
  type ProviderRow = ProviderListItem & { status?: string; plan?: string; cnpj?: string };
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [page, setPage] = useState(1);
  const limit = DEFAULT_LIMIT;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const query = new URLSearchParams();
      query.set('page', String(page));
      query.set('limit', String(limit));
      if (search.trim()) {
        query.set('search', search.trim());
      }
      if (statusFilter) {
        query.set('status', statusFilter);
      }
      if (planFilter) {
        query.set('plan', planFilter);
      }

      // A API retorna envelope { success, data: Provider[], pagination }
      // Tratamos os dois formatos: (data: []) e (data: { data: [], pagination })
      const res = await ApiService.get<any>(`/providers?${query.toString()}`);
      const dataArray = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      const pagination = (res as any).pagination ?? res.data?.pagination ?? null;

      setProviders(dataArray);
      setTotal(pagination?.total ?? dataArray.length ?? 0);
      setTotalPages(pagination?.totalPages ?? 1);
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao carregar provedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, planFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProviders();
  };

  return (
    <div className="providers-page" style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Provedores</h1>
        <Button variant="primary" onClick={() => navigate('/providers/create')}>
          Criar Provedor
        </Button>
      </div>

      <Card variant="elevated">
        <div className="table-toolbar">
          <form onSubmit={handleSearchSubmit} className="table-toolbar__filters">
            <Input
              placeholder="Buscar por nome ou workspace"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
            <Button type="submit">Buscar</Button>
          </form>
          <Select placeholder="Status" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
            <option value="">Todos status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="suspended">Suspenso</option>
            <option value="pending">Pendente</option>
          </Select>
          <Select placeholder="Plano" value={planFilter} onChange={(e) => { setPage(1); setPlanFilter(e.target.value); }}>
            <option value="">Todos planos</option>
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </Select>
          <Button variant="primary" onClick={() => navigate('/providers/create')}>Criar Provedor</Button>
        </div>

        {error && (
          <div style={{ padding: 16 }}>
            <Alert variant="error" title="Erro">
              {error}
            </Alert>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
            <Spinner size="md" label="Carregando provedores..." />
          </div>
        ) : (
          <div>
            <Table variant="striped" hoverable responsive className="table--sticky-header">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell scope="col">Nome</TableHeaderCell>
                  <TableHeaderCell scope="col">Workspace</TableHeaderCell>
                  <TableHeaderCell scope="col">E-mail</TableHeaderCell>
                  <TableHeaderCell scope="col">Plano</TableHeaderCell>
                  <TableHeaderCell scope="col">Status</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div style={{ padding: 16, textAlign: 'center', color: '#666' }}>
                        Nenhum provedor encontrado
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  providers.map((p) => (
                    <TableRow key={p.id} onClick={() => navigate(`/providers/${p.id}`)}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.workspace}</TableCell>
                      <TableCell>{p.email || '-'}</TableCell>
                      <TableCell>
                        {p.plan ? (
                          <Badge variant="info">{p.plan}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {p.status ? (
                          <Badge variant={p.status === 'active' ? 'success' : 'warning'}>{p.status}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#666' }}>
                Total: {total} {total === 1 ? 'registro' : 'registros'}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProvidersListPage;