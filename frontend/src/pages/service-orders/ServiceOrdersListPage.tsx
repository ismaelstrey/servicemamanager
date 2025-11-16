import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Pagination, 
  Spinner, 
  Alert,
  Heading
} from '../../components/ui';
import styled from 'styled-components';
import { ServiceOrderService, type ServiceOrder, type ServiceOrderFilters } from '../../services/serviceOrderService'
import ServiceOrdersToolbar from './components/ServiceOrdersToolbar';
import ServiceOrdersTable from './components/ServiceOrdersTable';
import ServiceOrdersGrid from './components/ServiceOrdersGrid';

type ListOrder = ServiceOrder

const ServiceOrdersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [serviceOrders, setServiceOrders] = useState<ListOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Alternância de visualização (lista ou grade)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'pending', label: 'Pendente' },
    { value: 'in_progress', label: 'Em Andamento' },
    { value: 'waiting_parts', label: 'Aguardando Peças' },
    { value: 'waiting_client', label: 'Aguardando Cliente' },
    { value: 'completed', label: 'Concluída' },
    { value: 'cancelled', label: 'Cancelada' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'Todas as Prioridades' },
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  

  const [totalItems, setTotalItems] = useState(0)

  const loadServiceOrders = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const filters: Partial<ServiceOrderFilters> = {}
      if (searchTerm) filters.search = searchTerm
      if (statusFilter !== 'all') filters.status = statusFilter
      if (priorityFilter !== 'all') filters.priority = priorityFilter
      
      filters.page = currentPage
      filters.limit = itemsPerPage
      const res = await ServiceOrderService.getServiceOrders(filters as ServiceOrderFilters)
      setServiceOrders((res as unknown as ServiceOrder[]) || [])
      setTotalItems(Array.isArray(res as any) ? (res as any).length : ((res as any)?.pagination?.total ?? ((res as any)?.data?.length ?? 0)))
    } catch (e) {
      const apiMsg = (e as any)?.response?.data?.message
      setError(typeof apiMsg === 'string' ? apiMsg : 'Erro ao carregar ordens de serviço. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, statusFilter, priorityFilter, currentPage, itemsPerPage])

  useEffect(() => {
    loadServiceOrders()
  }, [loadServiceOrders])

  

  const paginatedServiceOrders = serviceOrders

  const handleServiceOrderClick = (id: number) => {
    navigate(`/service-orders/${id}`);
  };

  if (error) {
    return (
      <Page>
        <Alert variant="error" title="Erro" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      </Page>
    );
  }

  return (
    <Page>
      <Header>
        <Heading level={1}>Ordens de Serviço</Heading>
        <Button
          variant="primary"
          onClick={() => navigate('/service-orders/create')}
        >
          Nova Ordem de Serviço
        </Button>
      </Header>

      <HeaderActions>
        <ViewToggle>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            Lista
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            Grade
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/service-orders/kanban')}
          >
            Kanban
          </Button>
        </ViewToggle>
        <QuickNav>
          <Button variant="outline" onClick={() => navigate('/service-orders/calendar')}>Calendário</Button>
          <Button variant="outline" onClick={() => navigate('/service-orders/reports')}>Relatórios</Button>
        </QuickNav>
      </HeaderActions>

      <ServiceOrdersToolbar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        onClearFilters={() => {
          setSearchTerm('');
          setStatusFilter('all');
          setPriorityFilter('all');
        }}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
      />

      <TableContainer>
        {isLoading ? (
          <LoadingContainer>
            <Spinner />
            <p>Carregando ordens de serviço...</p>
          </LoadingContainer>
        ) : viewMode === 'list' ? (
          <ServiceOrdersTable
            orders={paginatedServiceOrders}
            onRowClick={handleServiceOrderClick}
            onView={(id) => navigate(`/service-orders/${id}`)}
          />
        ) : (
          <ServiceOrdersGrid
            orders={paginatedServiceOrders}
            onCardClick={handleServiceOrderClick}
            onView={(id) => navigate(`/service-orders/${id}`)}
          />
        )}

        {!isLoading && paginatedServiceOrders.length === 0 && (
          <EmptyState>
            <p>Nenhuma ordem de serviço encontrada.</p>
            <Button
              variant="primary"
              onClick={() => navigate('/service-orders/create')}
            >
              Criar primeira ordem de serviço
            </Button>
          </EmptyState>
        )}
      </TableContainer>

      {!isLoading && totalItems > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalItems / itemsPerPage)}
          onPageChange={setCurrentPage}
          showFirstLast
          showPrevNext
        />
      )}
    </Page>
  );
};

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ViewToggle = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const QuickNav = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-left: auto;
`;

const TableContainer = styled(Card)`
  overflow: auto;
  & table thead th {
    position: sticky;
    top: 0;
    background: ${({ theme }) => theme.colors.background.secondary};
    z-index: 1;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
`;


const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
`;

export default ServiceOrdersListPage;
