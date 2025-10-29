import React from 'react';
import Card, { CardHeader, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import type { Ticket, TicketStatus } from '../../types/ticket';

export interface RecentTicketsProps {
  tickets: Ticket[];
  loading?: boolean;
  onViewAll?: () => void;
  onTicketClick?: (ticket: Ticket) => void;
}

const getStatusVariant = (status: TicketStatus) => {
  switch (status) {
    case 'open':
      return 'info';
    case 'in_progress':
      return 'warning';
    case 'pending':
      return 'warning';
    case 'resolved':
      return 'success';
    case 'closed':
      return 'secondary';
    case 'cancelled':
      return 'danger';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: TicketStatus) => {
  switch (status) {
    case 'open':
      return 'Aberto';
    case 'in_progress':
      return 'Em Andamento';
    case 'pending':
      return 'Pendente';
    case 'resolved':
      return 'Resolvido';
    case 'closed':
      return 'Fechado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
    case 'alta':
      return '#ef4444';
    case 'medium':
    case 'média':
      return '#f59e0b';
    case 'low':
    case 'baixa':
      return '#10b981';
    default:
      return '#6b7280';
  }
};

export const RecentTickets: React.FC<RecentTicketsProps> = ({
  tickets,
  loading = false,
  onViewAll,
  onTicketClick,
}) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card variant="default" className="recent-tickets">
      <CardHeader>
        <div className="recent-tickets__header">
          <h3 className="recent-tickets__title">Tickets Recentes</h3>
          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
            >
              Ver Todos
            </Button>
          )}
        </div>
      </CardHeader>

      <CardBody>
        {loading ? (
          <div className="recent-tickets__loading">
            <Spinner size="md" label="Carregando tickets..." />
          </div>
        ) : tickets.length === 0 ? (
          <div className="recent-tickets__empty">
            <p className="recent-tickets__empty-message">
              Nenhum ticket encontrado
            </p>
          </div>
        ) : (
          <div className="recent-tickets__list">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="recent-tickets__item"
                onClick={() => onTicketClick?.(ticket)}
              >
                <div className="recent-tickets__item-header">
                  <div className="recent-tickets__item-info">
                    <span className="recent-tickets__item-number">
                      #{ticket.number}
                    </span>
                    <div
                      className="recent-tickets__priority-indicator"
                      style={{
                        backgroundColor: getPriorityColor(ticket.priority),
                      }}
                    />
                  </div>
                  <Badge
                    variant={getStatusVariant(ticket.status)}
                    size="sm"
                  >
                    {getStatusLabel(ticket.status)}
                  </Badge>
                </div>

                <div className="recent-tickets__item-content">
                  <h4 className="recent-tickets__item-title">
                    {ticket.title}
                  </h4>
                  <p className="recent-tickets__item-description">
                    {ticket.description}
                  </p>
                </div>

                <div className="recent-tickets__item-meta">
                  <div className="recent-tickets__item-customer">
                    <span className="recent-tickets__item-customer-name">
                      {ticket.customerInfo.name}
                    </span>
                    {ticket.customerInfo.company && (
                      <span className="recent-tickets__item-customer-company">
                        • {ticket.customerInfo.company}
                      </span>
                    )}
                  </div>
                  <div className="recent-tickets__item-date">
                    <span className="recent-tickets__item-date-value">
                      {formatDate(ticket.createdAt)}
                    </span>
                    <span className="recent-tickets__item-time-value">
                      {formatTime(ticket.createdAt)}
                    </span>
                  </div>
                </div>

                {ticket.assignedTo && (
                  <div className="recent-tickets__item-assignee">
                    <span className="recent-tickets__item-assignee-label">
                      Atribuído para:
                    </span>
                    <span className="recent-tickets__item-assignee-name">
                      {ticket.assignee?.name ?? `#${ticket.assignedTo}`}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentTickets;