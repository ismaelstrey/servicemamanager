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

interface ServiceOrder {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  clientName: string;
  assignedTo?: string;
  estimatedHours: number;
  actualHours?: number;
  cost: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  equipmentId?: string;
  equipmentName?: string;
}

const ServiceOrdersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'pending', label: 'Pendente' },
    { value: 'in_progress', label: 'Em Andamento' },
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

  const categoryOptions = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'installation', label: 'Instalação' },
    { value: 'maintenance', label: 'Manutenção' },
    { value: 'repair', label: 'Reparo' },
    { value: 'upgrade', label: 'Upgrade' },
    { value: 'consultation', label: 'Consultoria' },
    { value: 'training', label: 'Treinamento' }
  ];

  // Mock function to load service orders
  const loadServiceOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockServiceOrders: ServiceOrder[] = [
        {
          id: '1',
          title: 'Instalação de Servidor',
          description: 'Instalação e configuração de novo servidor Dell PowerEdge',
          status: 'in_progress',
          priority: 'high',
          category: 'installation',
          clientName: 'Empresa ABC Ltda',
          assignedTo: 'João Silva',
          estimatedHours: 8,
          actualHours: 6,
          cost: 2500.00,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-16T14:20:00Z',
          dueDate: '2024-01-20T18:00:00Z',
          equipmentId: '1',
          equipmentName: 'Server-01'
        },
        {
          id: '2',
          title: 'Manutenção Preventiva Switch',
          description: 'Manutenção preventiva mensal do switch core',
          status: 'pending',
          priority: 'medium',
          category: 'maintenance',
          clientName: 'Tech Solutions',
          estimatedHours: 4,
          cost: 800.00,
          createdAt: '2024-01-14T09:15:00Z',
          updatedAt: '2024-01-14T09:15:00Z',
          dueDate: '2024-01-18T16:00:00Z',
          equipmentId: '2',
          equipmentName: 'Switch-Core-01'
        },
        {
          id: '3',
          title: 'Reparo Firewall',
          description: 'Reparo de módulo de rede do firewall principal',
          status: 'completed',
          priority: 'urgent',
          category: 'repair',
          clientName: 'Secure Corp',
          assignedTo: 'Maria Santos',
          estimatedHours: 6,
          actualHours: 8,
          cost: 1800.00,
          createdAt: '2024-01-10T08:00:00Z',
          updatedAt: '2024-01-12T17:30:00Z',
          equipmentId: '3',
          equipmentName: 'Firewall-01'
        },
        {
          id: '4',
          title: 'Upgrade Sistema Monitoramento',
          description: 'Atualização do sistema de monitoramento Zabbix',
          status: 'pending',
          priority: 'low',
          category: 'upgrade',
          clientName: 'Monitor Plus',
          estimatedHours: 12,
          cost: 3200.00,
          createdAt: '2024-01-13T11:45:00Z',
          updatedAt: '2024-01-13T11:45:00Z',
          dueDate: '2024-01-25T18:00:00Z'
        },
        {
          id: '5',
          title: 'Consultoria Segurança',
          description: 'Consultoria para implementação de políticas de segurança',
          status: 'in_progress',
          priority: 'medium',
          category: 'consultation',
          clientName: 'SafeNet Inc',
          assignedTo: 'Carlos Oliveira',
          estimatedHours: 16,
          actualHours: 4,
          cost: 4500.00,
          createdAt: '2024-01-12T14:20:00Z',
          updatedAt: '2024-01-15T16:10:00Z',
          dueDate: '2024-01-30T18:00:00Z'
        }
      ];
      
      setServiceOrders(mockServiceOrders);
    } catch {
      setError('Erro ao carregar ordens de serviço. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServiceOrders();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Andamento';
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

  const filteredServiceOrders = serviceOrders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || order.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const paginatedServiceOrders = filteredServiceOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleServiceOrderClick = (id: string) => {
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

      <div className="service-orders-filters">
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

        <Dropdown>
          <Button variant="outline">
            {categoryOptions.find(opt => opt.value === categoryFilter)?.label}
          </Button>
          {categoryOptions.map(option => (
            <DropdownItem
              key={option.value}
              onClick={() => setCategoryFilter(option.value)}
            >
              {option.label}
            </DropdownItem>
          ))}
        </Dropdown>

        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setPriorityFilter('all');
            setCategoryFilter('all');
          }}
        >
          Limpar Filtros
        </Button>
      </div>

      <Card className="service-orders-table-container">
        {isLoading ? (
          <div className="loading-container">
            <Spinner />
            <p>Carregando ordens de serviço...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Título</TableHeaderCell>
                <TableHeaderCell>Cliente</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Prioridade</TableHeaderCell>
                <TableHeaderCell>Categoria</TableHeaderCell>
                <TableHeaderCell>Responsável</TableHeaderCell>
                <TableHeaderCell>Valor</TableHeaderCell>
                <TableHeaderCell>Prazo</TableHeaderCell>
                <TableHeaderCell>Ações</TableHeaderCell>
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
                      {order.equipmentName && (
                        <small>({order.equipmentName})</small>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{order.clientName}</TableCell>
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
                  <TableCell>{order.category}</TableCell>
                  <TableCell>{order.assignedTo || 'Não atribuído'}</TableCell>
                  <TableCell>{formatCurrency(order.cost)}</TableCell>
                  <TableCell>
                    {order.dueDate ? formatDate(order.dueDate) : 'Sem prazo'}
                  </TableCell>
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

      {!isLoading && filteredServiceOrders.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredServiceOrders.length / itemsPerPage)}
          onPageChange={setCurrentPage}
          showFirstLast
          showPrevNext
        />
      )}
    </div>
  );
};

export default ServiceOrdersListPage;