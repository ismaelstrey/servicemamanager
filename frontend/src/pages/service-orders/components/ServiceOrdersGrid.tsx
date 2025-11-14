import React from 'react';
import styled from 'styled-components';
import { Card, Badge, Button } from '../../../components/ui';
import type { ServiceOrder } from '../../../services/serviceOrderService';

interface Props {
  orders: ServiceOrder[];
  onCardClick: (id: number) => void;
  onView: (id: number) => void;
}

const ServiceOrdersGrid: React.FC<Props> = ({ orders, onCardClick, onView }) => {
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

  return (
    <Grid>
      {orders.map(order => (
        <OrderCard key={order.id} onClick={() => onCardClick(order.id)}>
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
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onView(order.id); }}>Ver</Button>
          </OrderCardActions>
        </OrderCard>
      ))}
    </Grid>
  );
};

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

export default ServiceOrdersGrid;