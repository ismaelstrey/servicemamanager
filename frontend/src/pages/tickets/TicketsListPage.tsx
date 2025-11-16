import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card, CardBody,
  Button, Badge,
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
const TicketFilters = React.lazy(() => import('../../components/tickets/ticketFilters'));
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { useNotifications } from '../../hooks/useNotifications';
import { usePresence } from '../../hooks/usePresence';
import TicketsListActions from '../../components/tickets/TicketsListActions'
import TicketsListHeader from '../../components/tickets/TicketsListHeader'
import { Block } from '../../components/layout/Flex/Flex';

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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => (localStorage.getItem('tickets.viewMode') as 'list' | 'grid') || 'list');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem('favorites.tickets');
      return raw ? JSON.parse(raw) as number[] : [];
    } catch {
      return [];
    }
  });

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
  const isGlobalView = providerId == null || user?.role === UserRole.ADMIN;

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
      const useGlobal = providerId == null || user?.role === UserRole.ADMIN;
      const response = useGlobal
        ? await TicketService.getTicketsAll(apiFilters, currentPage, ITEMS_PER_PAGE)
        : await TicketService.getTickets(providerId!, apiFilters, currentPage, ITEMS_PER_PAGE);

      // Normalizar possíveis statuses antigos do backend
      setTickets((response.data || []).map((t: Ticket) => ({
        ...t,
        status: ((t as any).status === 'waiting_client' ? 'pending' : t.status) as TicketStatus,
      })));
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

  // Persistência do modo de visualização
  useEffect(() => {
    try { localStorage.setItem('tickets.viewMode', viewMode); } catch { }
  }, [viewMode]);

  // Utilitário: alternar favorito
  const toggleFavorite = (id: number) => {
    setFavoriteIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem('favorites.tickets', JSON.stringify(next)); } catch { }
      return next;
    });
  };

  // Tickets exibidos considerando favoritos
  const displayedTickets = useMemo(() => {
    return showFavoritesOnly ? tickets.filter(t => favoriteIds.includes(t.id)) : tickets;
  }, [tickets, showFavoritesOnly, favoriteIds]);

  // Exportações avançadas
  const exportCSV = () => {
    const rows = displayedTickets.map(t => ({
      Numero: t.number ?? t.id,
      Titulo: t.title,
      Cliente: t.customerInfo?.name ?? '',
      Email: t.customerInfo?.email ?? '',
      Status: statusLabels[t.status],
      Prioridade: priorityLabels[t.priority],
      Categoria: categoryLabels[t.category],
      Responsavel: t.assignee?.name ?? '',
      CriadoEm: new Date(t.createdAt).toISOString()
    }));
    const headers = Object.keys(rows[0] || {});
    const csv = [headers.join(';'), ...rows.map(r => headers.map(h => String((r as any)[h]).replace(/;/g, ',')).join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'tickets.csv');
  };

  const exportExcel = () => {
    const data = displayedTickets.map(t => ({
      Numero: t.number ?? t.id,
      Titulo: t.title,
      Cliente: t.customerInfo?.name ?? '',
      Email: t.customerInfo?.email ?? '',
      Status: statusLabels[t.status],
      Prioridade: priorityLabels[t.priority],
      Categoria: categoryLabels[t.category],
      Responsavel: t.assignee?.name ?? '',
      CriadoEm: new Date(t.createdAt).toLocaleString('pt-BR')
    }));
    const sheet = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Tickets');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'tickets.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Relatório de Tickets', 14, 16);
    let y = 26;
    displayedTickets.slice(0, 50).forEach(t => {
      const line = `${t.number ?? t.id} • ${t.title} • ${statusLabels[t.status]} • ${priorityLabels[t.priority]} • ${t.customerInfo?.name ?? ''}`;
      doc.text(line.substring(0, 95), 14, y);
      y += 6;
      if (y > 280) { doc.addPage(); y = 20; }
    });
    doc.save('tickets.pdf');
  };

  // Exportar evento ICS para um ticket
  const exportICS = (ticket: Ticket) => {
    const start = new Date(ticket.createdAt);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const fmt = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
    const uid = `${ticket.id}@telecomai`;
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TelecomAI//PT-BR',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${(ticket.title || 'Ticket')}`,
      `DESCRIPTION:Status ${statusLabels[ticket.status]} - Prioridade ${priorityLabels[ticket.priority]}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    saveAs(blob, `ticket-${ticket.number ?? ticket.id}.ics`);
  };

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

  // Notificações e presença
  const { count: notificationCount } = useNotifications();
  const { count: presenceCount } = usePresence('telecomai-tickets-presence');

  if (loading && tickets.length === 0) {
    return (
      <div className="tickets-list tickets-list--loading">
        <Spinner size="lg" centered label="Carregando tickets..." />
      </div>
    );
  }

  return (
    <Block>
    
        <Block >
                  <TicketsListHeader isGlobalView={isGlobalView} totalItems={totalItems} />
        </Block>
        <Block>  
                <TicketsListActions
                  viewMode={viewMode}
                  showFavoritesOnly={showFavoritesOnly}
                  presenceCount={presenceCount}
                  notificationCount={notificationCount}
                  onListView={() => setViewMode('list')}
                  onGridView={() => setViewMode('grid')}
                  onKanban={() => navigate('/tickets/kanban')}
                  onToggleFavorites={() => setShowFavoritesOnly(v => !v)}
                  onExportCSV={exportCSV}
                  onExportExcel={exportExcel}
                  onExportPDF={exportPDF}
                  onNewTicket={() => navigate('/tickets/new')}
                />
        </Block>
 

      {error && (
        <Alert variant="danger" title="Erro">
          {error}
        </Alert>
      )}

      <Suspense fallback={<Spinner />}>
        <TicketFilters
          filters={{
            search: filters.search,
            status: filters.status,
            priority: filters.priority,
            category: filters.category,
          }}
          hasActiveFilters={hasActiveFilters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />
      </Suspense>

      {viewMode === 'list' && (
        <Card className="tickets-list__table">
          <Table hoverable className="table--sticky-header">
            <TableHeader>
              <TableRow>
                <TableHeaderCell scope="col">Número</TableHeaderCell>
                <TableHeaderCell scope="col">Título</TableHeaderCell>
                <TableHeaderCell scope="col">Status</TableHeaderCell>
                <TableHeaderCell scope="col">Prioridade</TableHeaderCell>
                <TableHeaderCell scope="col">Responsável</TableHeaderCell>
                <TableHeaderCell scope="col">Criado em</TableHeaderCell>
                <TableHeaderCell scope="col">Ações</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTickets.map((ticket) => (
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
                      <Button size="sm" variant={favoriteIds.includes(ticket.id) ? 'primary' : 'secondary'} onClick={(e) => { e.stopPropagation(); toggleFavorite(ticket.id); }}>
                        {favoriteIds.includes(ticket.id) ? '★' : '☆'}
                      </Button>
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
                      <DropdownItem onClick={(e) => { e?.stopPropagation(); exportICS(ticket); }}>
                        Exportar ICS
                      </DropdownItem>
                      <DropdownItem onClick={(e) => { e?.stopPropagation(); toggleFavorite(ticket.id); }}>
                        {favoriteIds.includes(ticket.id) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                      </DropdownItem>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {displayedTickets.length === 0 && !loading && (
            <div className="tickets-list__empty">
              <div className="tickets-list__empty-icon">🎫</div>
              <h3>Nenhum ticket encontrado</h3>
              <p>
                {hasActiveFilters || showFavoritesOnly
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
              {displayedTickets.map(ticket => (
                <div key={ticket.id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1rem', background: 'var(--color-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <code className="tickets-list__number">{ticket.number ?? ticket.id}</code>
                    <Badge variant={getPriorityVariant(ticket.priority)}>{priorityLabels[ticket.priority] ?? '—'}</Badge>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>{ticket.title}</div>
                  {/* Removido: info do cliente não vem da API */}
                  <div style={{ marginTop: '0.5rem' }}>
                    <Badge variant={getStatusVariant(ticket.status)}>{statusLabels[ticket.status] ?? String(ticket.status)}</Badge>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Criado: {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/tickets/${ticket.id}`)}>Abrir</Button>
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/tickets/${ticket.id}/edit`)}>Editar</Button>
                    <Button size="sm" variant="secondary" onClick={() => exportICS(ticket)}>ICS</Button>
                    <Button size="sm" variant={favoriteIds.includes(ticket.id) ? 'primary' : 'secondary'} onClick={() => toggleFavorite(ticket.id)}>
                      {favoriteIds.includes(ticket.id) ? '★' : '☆'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {displayedTickets.length === 0 && !loading && (
              <div className="tickets-list__empty">
                <div className="tickets-list__empty-icon">🎫</div>
                <h3>Nenhum ticket encontrado</h3>
                <p>{hasActiveFilters || showFavoritesOnly ? 'Tente ajustar os filtros.' : 'Ainda não há tickets.'}</p>
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
    </Block>
  );
}
