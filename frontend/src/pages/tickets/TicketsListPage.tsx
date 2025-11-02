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
import { TicketService } from '../../services/ticketService';
import { useAuth } from '../../hooks/useAuth';

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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
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

  const { user } = useAuth();
  const providerId = user?.providerId;
  const isGlobalView = providerId == null || user?.role === UserRole.ADMIN ;

  const loadTickets = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Converter filtros para o formato esperado pela API
      const apiFilters: any = {};
      
      if (filters.search) {
        apiFilters.search = filters.search;
      }
      
      if (filters.status !== 'all') {
        apiFilters.status = filters.status;
      }
      
      if (filters.priority !== 'all') {
        apiFilters.priority = filters.priority;
      }
      
      if (filters.category !== 'all') {
        apiFilters.category = filters.category;
      }

      // Buscar tickets do backend: global se não houver providerId ou perfil admin
      const useGlobal = providerId == null || user?.role === UserRole.ADMIN ;
      const response = useGlobal
        ? await TicketService.getTicketsAll(apiFilters, currentPage, ITEMS_PER_PAGE)
        : await TicketService.getTickets(providerId!, apiFilters, currentPage, ITEMS_PER_PAGE);

      setTickets(response.data || []);
      setTotalItems(response.pagination?.total ?? 0);
    } catch (err) {
      setError('Erro ao carregar tickets');
      console.error('Tickets loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, providerId]);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="tickets-list__title">Tickets</h1>
            <Badge variant={isGlobalView ? 'info' : 'secondary'}>
              {isGlobalView ? 'Visão Global' : 'Visão por Provedor'}
            </Badge>
          </div>
          <p className="tickets-list__subtitle">
            {totalItems} ticket{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="tickets-list__actions">
          <div style={{ display: 'inline-flex', gap: '0.5rem', marginRight: '0.5rem' }}>
            <Button variant={viewMode === 'list' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('list')}>Lista</Button>
            <Button variant={viewMode === 'grid' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('grid')}>Grade</Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/tickets/kanban')}>Kanban</Button>
          </div>
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

      {viewMode === 'list' && (
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
                  <code className="tickets-list__number">{ticket.number ?? ticket.id}</code>
                </TableCell>
                <TableCell>
                  <div className="tickets-list__title-cell">
                    <span className="tickets-list__ticket-title">{ticket.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="tickets-list__customer">
                    <span className="tickets-list__customer-name">{ticket.customerInfo?.name ?? '—'}</span>
                    <span className="tickets-list__customer-email">{ticket.customerInfo?.email ?? ''}</span>
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
                    {categoryLabels[ticket.category] ?? '—'}
                  </span>
                </TableCell>
                <TableCell>
                  {ticket.assignee?.name ? (
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
      )}

      {viewMode === 'grid' && (
        <Card>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {tickets.map(ticket => (
                <div key={ticket.id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1rem', background: 'var(--color-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <code className="tickets-list__number">{ticket.number ?? ticket.id}</code>
                    <Badge variant={getPriorityVariant(ticket.priority)}>{priorityLabels[ticket.priority] ?? '—'}</Badge>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>{ticket.title}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{ticket.customerInfo?.name ?? '—'} • {ticket.customerInfo?.email ?? ''}</div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <Badge variant={getStatusVariant(ticket.status)}>{statusLabels[ticket.status] ?? String(ticket.status)}</Badge>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Criado: {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/tickets/${ticket.id}`)}>Abrir</Button>
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/tickets/${ticket.id}/edit`)}>Editar</Button>
                  </div>
                </div>
              ))}
            </div>
            {tickets.length === 0 && !loading && (
              <div className="tickets-list__empty">
                <div className="tickets-list__empty-icon">🎫</div>
                <h3>Nenhum ticket encontrado</h3>
                <p>{hasActiveFilters ? 'Tente ajustar os filtros.' : 'Ainda não há tickets.'}</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

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