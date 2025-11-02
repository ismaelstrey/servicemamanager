import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card, CardBody,
  Button, Input, Select, Badge,
  Dropdown, DropdownItem,
  Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell,
  Pagination,
  Spinner,
  Alert
} from '../../components/ui';
import type { Ticket, TicketStatus, TicketCategory } from '../../types/ticket';
import type { Priority } from '../../types/common';
import { UserRole } from '../../types/auth';

interface TicketsFilters {
  search: string;
  status: TicketStatus | 'all';
  priority: Priority | 'all';
  category: TicketCategory | 'all';
  assignedTo: string | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month';
}

const ITEMS_PER_PAGE = 20;

const statusLabels: Record<TicketStatus, string> = {
  open: 'Aberto',
  assigned: 'Atribuído',
  in_progress: 'Em Andamento',
  pending: 'Pendente',
  resolved: 'Resolvido',
  closed: 'Fechado',
  cancelled: 'Cancelado',
};

const priorityLabels: Record<Priority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

const categoryLabels: Record<TicketCategory, string> = {
  hardware: 'Hardware',
  software: 'Software',
  network: 'Rede',
  security: 'Segurança',
  access: 'Acesso',
  email: 'Email',
  backup: 'Backup',
  maintenance: 'Manutenção',
  training: 'Treinamento',
  other: 'Outros',
};

const getStatusVariant = (status: TicketStatus): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
  switch (status) {
    case 'open': return 'danger';
    case 'assigned': return 'info';
    case 'in_progress': return 'warning';
    case 'pending': return 'info';
    case 'resolved': return 'success';
    case 'closed': return 'secondary';
    case 'cancelled': return 'secondary';
    default: return 'secondary';
  }
};

const getPriorityVariant = (priority: Priority): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
  switch (priority) {
    case 'low': return 'success';
    case 'medium': return 'info';
    case 'high': return 'warning';
    case 'urgent': return 'danger';
    default: return 'secondary';
  }
};

export function TicketsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [filters, setFilters] = useState<TicketsFilters>({
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') as TicketStatus) || 'all',
    priority: (searchParams.get('priority') as Priority) || 'all',
    category: (searchParams.get('category') as TicketCategory) || 'all',
    assignedTo: searchParams.get('assignedTo') || 'all',
    dateRange: (searchParams.get('dateRange') as 'all' | 'today' | 'week' | 'month') || 'all',
  });

  // Efeito de carregamento movido para após a definição de loadTickets

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      }
    });
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    setSearchParams(params);
  }, [filters, currentPage, setSearchParams]);

  const loadTickets = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock data - replace with actual API response
      const mockTickets: Ticket[] = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        providerId: 1,
        number: `TK-2024-${String(i + 1).padStart(3, '0')}`,
        title: `Ticket ${i + 1} - ${['Problema de conexão', 'Solicitação de upgrade', 'Suporte técnico', 'Dúvida sobre faturamento'][i % 4]}`,
        description: `Descrição detalhada do ticket ${i + 1}`,
        status: (['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed'] as TicketStatus[])[i % 6],
        priority: (['low', 'medium', 'high', 'urgent'] as Priority[])[i % 4],
        category: (['hardware', 'software', 'network', 'security', 'access', 'email', 'backup', 'maintenance', 'training', 'other'] as TicketCategory[])[i % 10],
        source: 'email',
        customerInfo: {
          name: `Cliente ${i + 1}`,
          email: `cliente${i + 1}@email.com`,
          phone: `(11) ${String(90000 + i).slice(0, 5)}-${String(1000 + i).slice(-4)}`,
        },
        createdAt: new Date(Date.now() - (i * 86400000)),
        updatedAt: new Date(Date.now() - (i * 3600000)),
        assignedTo: i % 3 === 0 ? 1 : undefined,
        assignee: i % 3 === 0 ? {
          id: 1,
          name: 'Maria Santos',
          email: 'maria@telecom.com',
          role: UserRole.USER,
          status: 'active',
          emailVerified: true,
          loginAttempts: 0,
          createdAt: new Date(Date.now() - (i * 900000)),
          updatedAt: new Date(Date.now() - (i * 600000)),
        } : undefined,
        tags: [],
        slaStatus: 'within_sla',
        comments: [],
        attachments: [],
        history: [],
      }));

      // Apply filters
      let filteredTickets = mockTickets;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredTickets = filteredTickets.filter(ticket =>
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.number.toLowerCase().includes(searchLower) ||
          ticket.customerInfo.name.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.status !== 'all') {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === filters.status);
      }
      
      if (filters.priority !== 'all') {
        filteredTickets = filteredTickets.filter(ticket => ticket.priority === filters.priority);
      }
      
      if (filters.category !== 'all') {
        filteredTickets = filteredTickets.filter(ticket => ticket.category === filters.category);
      }

      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

      setTickets(paginatedTickets);
      setTotalItems(filteredTickets.length);
    } catch (err) {
      setError('Erro ao carregar tickets');
      console.error('Tickets loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleFilterChange = (key: keyof TicketsFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      assignedTo: 'all',
      dateRange: 'all',
    });
    setCurrentPage(1);
  };

  const handleTicketClick = (ticket: Ticket) => {
    navigate(`/tickets/${ticket.id}`);
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value && value !== 'all');
  }, [filters]);

  if (loading && tickets.length === 0) {
    return (
      <div className="tickets-list tickets-list--loading">
        <Spinner size="lg" centered label="Carregando tickets..." />
      </div>
    );
  }

  return (
    <div className="tickets-list">
      <div className="tickets-list__header">
        <div className="tickets-list__title-section">
          <h1 className="tickets-list__title">Tickets</h1>
          <p className="tickets-list__subtitle">
            {totalItems} ticket{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="tickets-list__actions">
          <Button
            variant="primary"
            onClick={() => navigate('/tickets/new')}
            leftIcon="➕"
          >
            Novo Ticket
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Erro">
          {error}
        </Alert>
      )}

      <Card className="tickets-list__filters">
        <CardBody>
          <div className="table-toolbar">
            <div className="table-toolbar__filters">
              <Input
                placeholder="Buscar por título, número ou cliente..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                leftIcon="🔍"
              />
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">Todos os Status</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
              <Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="all">Todas as Prioridades</option>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">Todas as Categorias</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </div>
            <div className="table-toolbar__actions">
              {hasActiveFilters && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="tickets-list__table">
        <Table hoverable className="table--sticky-header">
          <TableHeader>
            <TableRow>
              <TableHeaderCell scope="col">Número</TableHeaderCell>
              <TableHeaderCell scope="col">Título</TableHeaderCell>
              <TableHeaderCell scope="col">Cliente</TableHeaderCell>
              <TableHeaderCell scope="col">Status</TableHeaderCell>
              <TableHeaderCell scope="col">Prioridade</TableHeaderCell>
              <TableHeaderCell scope="col">Categoria</TableHeaderCell>
              <TableHeaderCell scope="col">Responsável</TableHeaderCell>
              <TableHeaderCell scope="col">Criado em</TableHeaderCell>
              <TableHeaderCell scope="col">Ações</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                onClick={() => handleTicketClick(ticket)}
                className="tickets-list__row"
              >
                <TableCell>
                  <code className="tickets-list__number">{ticket.number}</code>
                </TableCell>
                <TableCell>
                  <div className="tickets-list__title-cell">
                    <span className="tickets-list__ticket-title">{ticket.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="tickets-list__customer">
                    <span className="tickets-list__customer-name">{ticket.customerInfo.name}</span>
                    <span className="tickets-list__customer-email">{ticket.customerInfo.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(ticket.status)}>
                    {statusLabels[ticket.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityVariant(ticket.priority)}>
                    {priorityLabels[ticket.priority]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="tickets-list__category">
                    {categoryLabels[ticket.category]}
                  </span>
                </TableCell>
                <TableCell>
                  {ticket.assignee ? (
                    <span className="tickets-list__assignee">{ticket.assignee.name}</span>
                  ) : (
                    <span className="tickets-list__unassigned">Não atribuído</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="tickets-list__date">
                    {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </TableCell>
                <TableCell>
                  <Dropdown>
                    <DropdownItem onClick={() => navigate(`/tickets/${ticket.id}`)}>
                      Ver Detalhes
                    </DropdownItem>
                    <DropdownItem onClick={() => navigate(`/tickets/${ticket.id}/edit`)}>
                      Editar
                    </DropdownItem>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {tickets.length === 0 && !loading && (
          <div className="tickets-list__empty">
            <div className="tickets-list__empty-icon">🎫</div>
            <h3>Nenhum ticket encontrado</h3>
            <p>
              {hasActiveFilters
                ? 'Tente ajustar os filtros para encontrar tickets.'
                : 'Ainda não há tickets cadastrados.'}
            </p>
            {!hasActiveFilters && (
              <Button
                variant="primary"
                onClick={() => navigate('/tickets/new')}
              >
                Criar Primeiro Ticket
              </Button>
            )}
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="tickets-list__pagination">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showFirstLast
            showPrevNext
          />
        </div>
      )}

      {loading && tickets.length > 0 && (
        <div className="tickets-list__loading-overlay">
          <Spinner size="sm" label="Atualizando..." />
        </div>
      )}
    </div>
  );
}