import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
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
import styled from 'styled-components';
import { ServiceOrderService, type ServiceOrder, type ServiceOrderFilters } from '../../services/serviceOrderService'
import ServiceOrdersToolbar from './components/ServiceOrdersToolbar';

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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'waiting_parts': return 'info';
      case 'waiting_client': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Andamento';
      case 'waiting_parts': return 'Aguardando Peças';
      case 'waiting_client': return 'Aguardando Cliente';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'urgent': return 'danger';
      default: return 'secondary';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return priority;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const paginatedServiceOrders = serviceOrders

  const handleServiceOrderClick = (id: number) => {
    navigate(`/service-orders/${id}`);
  };

  if (error) {
    return (
      <div className="service-orders-page">
        <Alert
          variant="danger"
          title="Erro"
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <Page>
      <Header>
        <h1>Ordens de Serviço</h1>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell scope="col">ID</TableHeaderCell>
                <TableHeaderCell scope="col">Título</TableHeaderCell>
                <TableHeaderCell scope="col">Provedor</TableHeaderCell>
                <TableHeaderCell scope="col">Status</TableHeaderCell>
                <TableHeaderCell scope="col">Prioridade</TableHeaderCell>
                <TableHeaderCell scope="col">Ticket</TableHeaderCell>
                <TableHeaderCell scope="col">Estimado (h)</TableHeaderCell>
                <TableHeaderCell scope="col">Agendada</TableHeaderCell>
                <TableHeaderCell scope="col">Valor</TableHeaderCell>
                <TableHeaderCell scope="col">Ações</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedServiceOrders.map(order => (
                <TableRow
                  key={order.id}
                  onClick={() => handleServiceOrderClick(order.id)}
                >
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    <ServiceOrderTitle>
                      <strong>{order.title}</strong>
                    </ServiceOrderTitle>
                  </TableCell>
                  <TableCell>{order.provider?.name ?? `#${order.providerId}`}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ServiceOrderPriority>
                      <PriorityDot priority={order.priority} />
                      <Badge variant={getPriorityColor(order.priority)} size="sm">
                        {getPriorityLabel(order.priority)}
                      </Badge>
                    </ServiceOrderPriority>
                  </TableCell>
                  <TableCell>
                    {order.ticket ? (
                      <span>#{order.ticket.id} • {order.ticket.title}</span>
                    ) : (
                      <span>#{order.ticketId}</span>
                    )}
                  </TableCell>
                  <TableCell>{order.estimatedHours}</TableCell>
                  <TableCell>{order.scheduledDate ? formatDate(order.scheduledDate) : '—'}</TableCell>
                  <TableCell>{order.cost != null ? formatCurrency(order.cost) : '—'}</TableCell>
                  <TableCell>
                    <RowActions>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/service-orders/${order.id}`);
                        }}
                      >
                        Ver
                      </Button>
                    </RowActions>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Grid>
            {paginatedServiceOrders.map(order => (
              <OrderCard key={order.id} onClick={() => handleServiceOrderClick(order.id)}>
                <OrderCardHeader>
                  <h3 style={{ margin: 0 }}>{order.title}</h3>
                  <Badge variant={getStatusVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
                </OrderCardHeader>
                <OrderCardContent>
                  <div><strong>Provedor:</strong> {order.provider?.name ?? `#${order.providerId}`}</div>
                  <ServiceOrderPriority>
                    <PriorityDot priority={order.priority} />
                    <Badge variant={getPriorityColor(order.priority)} size="sm">{getPriorityLabel(order.priority)}</Badge>
                  </ServiceOrderPriority>
                  <div><strong>Ticket:</strong> {order.ticket ? `#${order.ticket.id} • ${order.ticket.title}` : `#${order.ticketId}`}</div>
                  <div><strong>Agendada:</strong> {order.scheduledDate ? formatDate(order.scheduledDate) : '—'}</div>
                  <div><strong>Estimado (h):</strong> {order.estimatedHours}</div>
                  <div><strong>Valor:</strong> {order.cost != null ? formatCurrency(order.cost) : '—'}</div>
                </OrderCardContent>
                <OrderCardActions>
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/service-orders/${order.id}`); }}>Ver</Button>
                </OrderCardActions>
              </OrderCard>
            ))}
          </Grid>
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
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const QuickNav = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
`;

// Toolbar movida para componente separado em ./components/ServiceOrdersToolbar

const TableContainer = styled(Card)`
  overflow: auto;
  & table thead th {
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 1;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
`;

const ServiceOrderTitle = styled.div`
  display: flex;
  align-items: center;
`;

const ServiceOrderPriority = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PriorityDot = styled.span<{ priority: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  background-color: ${({ priority }) =>
    priority === 'low' ? '#28a745' :
    priority === 'medium' ? '#ffca2c' :
    '#dc3545'};
`;

const RowActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const OrderCard = styled(Card)`
  cursor: pointer;
`;

const OrderCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const OrderCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const OrderCardActions = styled.div`
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
`;

export default ServiceOrdersListPage;
