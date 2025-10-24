import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import type { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../../types/ticket';

interface TicketsFilters {
  search: string;
  status: TicketStatus | 'all';
  priority: TicketPriority | 'all';
  category: TicketCategory | 'all';
  assignedTo: string | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month';
}

const ITEMS_PER_PAGE = 20;

const statusLabels: Record<TicketStatus, string> = {
  open: 'Aberto',
  in_progress: 'Em Andamento',
  waiting_customer: 'Aguardando Cliente',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

const priorityLabels: Record<TicketPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

const categoryLabels: Record<TicketCategory, string> = {
  technical: 'Técnico',
  billing: 'Faturamento',
  support: 'Suporte',
  sales: 'Vendas',
  other: 'Outros',
};

const getStatusVariant = (status: TicketStatus): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
  switch (status) {
    case 'open': return 'danger';
    case 'in_progress': return 'warning';
    case 'waiting_customer': return 'info';
    case 'resolved': return 'success';
    case 'closed': return 'secondary';
    default: return 'secondary';
  }
};

const getPriorityVariant = (priority: TicketPriority): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
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
    priority: (searchParams.get('priority') as TicketPriority) || 'all',
    category: (searchParams.get('category') as TicketCategory) || 'all',
    assignedTo: searchParams.get('assignedTo') || 'all',
    dateRange: (searchParams.get('dateRange') as 'all' | 'today' | 'week' | 'month') || 'all',
  });

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

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
        id: `ticket-${i + 1}`,
        number: `TK-2024-${String(i + 1).padStart(3, '0')}`,
        title: `Ticket ${i + 1} - ${['Problema de conexão', 'Solicitação de upgrade', 'Suporte técnico', 'Dúvida sobre faturamento'][i % 4]}`,
        description: `Descrição detalhada do ticket ${i + 1}`,
        status: (['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'] as TicketStatus[])[i % 5],
        priority: (['low', 'medium', 'high', 'urgent'] as TicketPriority[])[i % 4],
        category: (['technical', 'billing', 'support', 'sales', 'other'] as TicketCategory[])[i % 5],
        source: 'email',
        customerInfo: {
          name: `Cliente ${i + 1}`,
          email: `cliente${i + 1}@email.com`,
          phone: `(11) ${String(90000 + i).slice(0, 5)}-${String(1000 + i).slice(-4)}`,
        },
        createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
        updatedAt: new Date(Date.now() - (i * 3600000)).toISOString(),
        assignedTo: i % 3 === 0 ? {
          id: '1',
          name: 'Maria Santos',
          email: 'maria@telecom.com',
        } : undefined,
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
        <CardHeader>
          <h3>Filtros</h3>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
            >
              Limpar Filtros
            </Button>
          )}
        </CardHeader>
        <CardBody>
          <div className="tickets-list__filters-grid">
            <Input
              placeholder="Buscar por título, número ou cliente..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              leftIcon="🔍"
            />
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="tickets-list__select"
            >
              <option value="all">Todos os Status</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="tickets-list__select"
            >
              <option value="all">Todas as Prioridades</option>
              {Object.entries(priorityLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="tickets-list__select"
            >
              <option value="all">Todas as Categorias</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      <Card className="tickets-list__table">
        <Table hoverable>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Número</TableHeaderCell>
              <TableHeaderCell>Título</TableHeaderCell>
              <TableHeaderCell>Cliente</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Prioridade</TableHeaderCell>
              <TableHeaderCell>Categoria</TableHeaderCell>
              <TableHeaderCell>Responsável</TableHeaderCell>
              <TableHeaderCell>Criado em</TableHeaderCell>
              <TableHeaderCell>Ações</TableHeaderCell>
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
                  {ticket.assignedTo ? (
                    <span className="tickets-list__assignee">{ticket.assignedTo.name}</span>
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