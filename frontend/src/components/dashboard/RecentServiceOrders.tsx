import React from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import type { ServiceOrder, ServiceOrderStatus } from '../../types/serviceOrder';

export interface RecentServiceOrdersProps {
  serviceOrders: ServiceOrder[];
  loading?: boolean;
  onViewAll?: () => void;
  onServiceOrderClick?: (serviceOrder: ServiceOrder) => void;
}

const getStatusVariant = (status: ServiceOrderStatus) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'scheduled':
      return 'info';
    case 'in_progress':
      return 'primary';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    case 'on_hold':
      return 'secondary';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: ServiceOrderStatus) => {
  switch (status) {
    case 'pending':
      return 'Pendente';
    case 'scheduled':
      return 'Agendado';
    case 'in_progress':
      return 'Em Andamento';
    case 'completed':
      return 'Concluído';
    case 'cancelled':
      return 'Cancelado';
    case 'on_hold':
      return 'Em Espera';
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

export const RecentServiceOrders: React.FC<RecentServiceOrdersProps> = ({
  serviceOrders,
  loading = false,
  onViewAll,
  onServiceOrderClick,
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card variant="default" className="recent-service-orders">
      <CardHeader>
        <div className="recent-service-orders__header">
          <h3 className="recent-service-orders__title">Ordens de Serviço Recentes</h3>
          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
            >
              Ver Todas
            </Button>
          )}
        </div>
      </CardHeader>

      <CardBody>
        {loading ? (
          <div className="recent-service-orders__loading">
            <Spinner size="md" label="Carregando ordens de serviço..." />
          </div>
        ) : serviceOrders.length === 0 ? (
          <div className="recent-service-orders__empty">
            <p className="recent-service-orders__empty-message">
              Nenhuma ordem de serviço encontrada
            </p>
          </div>
        ) : (
          <div className="recent-service-orders__list">
            {serviceOrders.map((serviceOrder) => (
              <div
                key={serviceOrder.id}
                className="recent-service-orders__item"
                onClick={() => onServiceOrderClick?.(serviceOrder)}
              >
                <div className="recent-service-orders__item-header">
                  <div className="recent-service-orders__item-info">
                    <span className="recent-service-orders__item-number">
                      OS #{serviceOrder.number}
                    </span>
                    <div
                      className="recent-service-orders__priority-indicator"
                      style={{
                        backgroundColor: getPriorityColor(serviceOrder.priority),
                      }}
                    />
                  </div>
                  <Badge
                    variant={getStatusVariant(serviceOrder.status)}
                    size="sm"
                  >
                    {getStatusLabel(serviceOrder.status)}
                  </Badge>
                </div>

                <div className="recent-service-orders__item-content">
                  <h4 className="recent-service-orders__item-title">
                    {serviceOrder.title}
                  </h4>
                  <p className="recent-service-orders__item-description">
                    {serviceOrder.description}
                  </p>
                </div>

                <div className="recent-service-orders__item-details">
                  <div className="recent-service-orders__item-customer">
                    <span className="recent-service-orders__item-customer-name">
                      {serviceOrder.customerInfo.name}
                    </span>
                    {serviceOrder.customerInfo.company && (
                      <span className="recent-service-orders__item-customer-company">
                        • {serviceOrder.customerInfo.company}
                      </span>
                    )}
                  </div>
                  
                  {serviceOrder.location && (
                    <div className="recent-service-orders__item-location">
                      <span className="recent-service-orders__item-location-icon">📍</span>
                      <span className="recent-service-orders__item-location-text">
                        {serviceOrder.location.city}, {serviceOrder.location.state}
                      </span>
                    </div>
                  )}
                </div>

                <div className="recent-service-orders__item-meta">
                  <div className="recent-service-orders__item-dates">
                    <div className="recent-service-orders__item-created">
                      <span className="recent-service-orders__item-date-label">Criado:</span>
                      <span className="recent-service-orders__item-date-value">
                        {formatDate(serviceOrder.createdAt)} às {formatTime(serviceOrder.createdAt)}
                      </span>
                    </div>
                    {serviceOrder.scheduledDate && (
                      <div className="recent-service-orders__item-scheduled">
                        <span className="recent-service-orders__item-date-label">Agendado:</span>
                        <span className="recent-service-orders__item-date-value">
                          {formatDate(serviceOrder.scheduledDate)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {serviceOrder.cost?.totalCost != null && (
                    <div className="recent-service-orders__item-cost">
                      <span className="recent-service-orders__item-cost-label">Custo total:</span>
                      <span className="recent-service-orders__item-cost-value">
                        {formatCurrency(serviceOrder.cost.totalCost)}
                      </span>
                    </div>
                  )}
                </div>

                {serviceOrder.assignee && (
                  <div className="recent-service-orders__item-technician">
                    <span className="recent-service-orders__item-technician-label">
                      Técnico:
                    </span>
                    <span className="recent-service-orders__item-technician-name">
                      {serviceOrder.assignee.name}
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

export default RecentServiceOrders;