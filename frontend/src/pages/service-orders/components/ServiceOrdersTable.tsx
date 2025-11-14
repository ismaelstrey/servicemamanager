import React from 'react';
import styled from 'styled-components';
import { 
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Button,
  Badge,
} from '../../../components/ui';
import type { ServiceOrder } from '../../../services/serviceOrderService';

interface Props {
  orders: ServiceOrder[];
  onRowClick: (id: number) => void;
  onView: (id: number) => void;
}

const ServiceOrdersTable: React.FC<Props> = ({ orders, onRowClick, onView }) => {
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
        {orders.map(order => (
          <TableRow
            key={order.id}
            onClick={() => onRowClick(order.id)}
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
                    onView(order.id);
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
  );
};

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

export default ServiceOrdersTable;