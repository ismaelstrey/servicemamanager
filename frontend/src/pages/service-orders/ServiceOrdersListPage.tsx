import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Input, 
  Badge, 
  Dropdown, 
  DropdownItem, 
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
import '../../styles/service-orders.css';
import { ServiceOrderService, type ServiceOrder, type ServiceOrderFilters } from '../../services/serviceOrderService'

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
      setServiceOrders(res.data || [])
      setTotalItems(res.pagination?.total ?? (res.data?.length ?? 0))
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
    <div className="service-orders-page">
      <div className="service-orders-header">
        <h1>Ordens de Serviço</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/service-orders/create')}
        >
          Nova Ordem de Serviço
        </Button>
      </div>

      <div className="service-orders-header-actions" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div className="view-toggle" style={{ display: 'flex', gap: '0.5rem' }}>
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
        </div>
        <div className="quick-nav" style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          <Button variant="outline" onClick={() => navigate('/service-orders/calendar')}>Calendário</Button>
          <Button variant="outline" onClick={() => navigate('/service-orders/reports')}>Relatórios</Button>
        </div>
      </div>

      <div className="table-toolbar">
        <div className="table-toolbar__filters">
          <Input
            placeholder="Buscar por título, cliente ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon="🔍"
          />
          
          <Dropdown>
            <Button variant="outline">
              {statusOptions.find(opt => opt.value === statusFilter)?.label}
            </Button>
            {statusOptions.map(option => (
              <DropdownItem
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
              </DropdownItem>
            ))}
          </Dropdown>

          <Dropdown>
            <Button variant="outline">
              {priorityOptions.find(opt => opt.value === priorityFilter)?.label}
            </Button>
            {priorityOptions.map(option => (
              <DropdownItem
                key={option.value}
                onClick={() => setPriorityFilter(option.value)}
              >
                {option.label}
              </DropdownItem>
            ))}
          </Dropdown>

          
        </div>
        <div className="table-toolbar__actions">
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      <Card className="service-orders-table-container">
        {isLoading ? (
          <div className="loading-container">
            <Spinner />
            <p>Carregando ordens de serviço...</p>
          </div>
        ) : viewMode === 'list' ? (
          <Table className="table--sticky-header">
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
                  className="service-order-row"
                  onClick={() => handleServiceOrderClick(order.id)}
                >
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    <div className="service-order-title">
                      <strong>{order.title}</strong>
                    </div>
                  </TableCell>
                  <TableCell>{order.provider?.name ?? `#${order.providerId}`}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="service-order-priority">
                      <span className={`priority-dot ${order.priority}`}></span>
                      <Badge variant={getPriorityColor(order.priority)} size="sm">
                        {getPriorityLabel(order.priority)}
                      </Badge>
                    </div>
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
                    <div className="service-order-actions">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="service-orders-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {paginatedServiceOrders.map(order => (
              <Card key={order.id} className="service-order-card" onClick={() => handleServiceOrderClick(order.id)}>
                <div className="service-order-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>{order.title}</h3>
                  <Badge variant={getStatusVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
                </div>
                <div className="service-order-card-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <div><strong>Provedor:</strong> {order.provider?.name ?? `#${order.providerId}`}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`priority-dot ${order.priority}`}></span>
                    <Badge variant={getPriorityColor(order.priority)} size="sm">{getPriorityLabel(order.priority)}</Badge>
                  </div>
                  <div><strong>Ticket:</strong> {order.ticket ? `#${order.ticket.id} • ${order.ticket.title}` : `#${order.ticketId}`}</div>
                  <div><strong>Agendada:</strong> {order.scheduledDate ? formatDate(order.scheduledDate) : '—'}</div>
                  <div><strong>Estimado (h):</strong> {order.estimatedHours}</div>
                  <div><strong>Valor:</strong> {order.cost != null ? formatCurrency(order.cost) : '—'}</div>
                </div>
                <div className="service-order-card-actions" style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/service-orders/${order.id}`); }}>Ver</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && paginatedServiceOrders.length === 0 && (
          <div className="empty-state">
            <p>Nenhuma ordem de serviço encontrada.</p>
            <Button
              variant="primary"
              onClick={() => navigate('/service-orders/create')}
            >
              Criar primeira ordem de serviço
            </Button>
          </div>
        )}
      </Card>

      {!isLoading && totalItems > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalItems / itemsPerPage)}
          onPageChange={setCurrentPage}
          showFirstLast
          showPrevNext
        />
      )}
    </div>
  );
};

export default ServiceOrdersListPage;
