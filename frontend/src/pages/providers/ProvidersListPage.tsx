import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
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
    <Page
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Header>
        <Title>Provedores</Title>
        <Button onClick={() => navigate('/providers/create')}>Criar Provedor</Button>
      </Header>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card>
          <Toolbar>
            <Filters onSubmit={handleSearchSubmit}>
              <Input
                placeholder="Buscar por nome ou workspace"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
              />
              <Button type="submit">Buscar</Button>
            </Filters>
            <Select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
              <option value="">Todos status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="suspended">Suspenso</option>
              <option value="pending">Pendente</option>
            </Select>
            <Select value={planFilter} onChange={(e) => { setPage(1); setPlanFilter(e.target.value); }}>
              <option value="">Todos planos</option>
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </Select>
            <Button onClick={() => navigate('/providers/create')}>Criar Provedor</Button>
          </Toolbar>

          <AnimatePresence>{error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Pad>
                <Alert variant="error">{error}</Alert>
              </Pad>
            </motion.div>
          )}</AnimatePresence>

          {loading ? (
            <Centered>
              <Spinner size="md" label="Carregando provedores..." />
            </Centered>
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
                        <Empty>Nenhum provedor encontrado</Empty>
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

              <Footer>
                <Muted>Total: {total} {total === 1 ? 'registro' : 'registros'}</Muted>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </Footer>
            </div>
          )}
        </Card>
      </motion.div>
    </Page>
  );
};

export default ProvidersListPage;

// styled-components
const Page = styled(motion.div)`
  display: grid;
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;
`;

const Toolbar = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
`;

const Filters = styled.form`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
`;

const Pad = styled.div`
  padding: 16px;
`;

const Centered = styled.div`
  padding: 24px;
  display: flex;
  justify-content: center;
`;

const Empty = styled.div`
  padding: 16px;
  text-align: center;
  color: #666;
`;

const Footer = styled.div`
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Muted = styled.div`
  color: #666;
`;