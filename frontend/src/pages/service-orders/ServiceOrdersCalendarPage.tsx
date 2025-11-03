import React, { useEffect, useMemo, useState } from 'react';
import { Card, Button, Badge, Spinner, Alert } from '../../components/ui';
import ServiceOrderService from '../../services/serviceOrderService';
import type { ServiceOrder } from '../../services/serviceOrderService';

// Página de calendário de Ordens de Serviço com navegação mensal
const ServiceOrdersCalendarPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await ServiceOrderService.getServiceOrders({ page: 1, limit: 100 });
        setServiceOrders(res.data || []);
      } catch (e) {
        setError('Erro ao carregar ordens de serviço para o calendário.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, [currentMonth]);

  const startOfMonth = useMemo(() => {
    const d = new Date(currentMonth);
    d.setDate(1);
    return d;
  }, [currentMonth]);

  const daysInMonth = useMemo(() => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    return d.getDate();
  }, [currentMonth]);

  const firstWeekdayIndex = useMemo(() => {
    // 0 = domingo, queremos segunda como começo (PT-BR)
    const w = startOfMonth.getDay();
    return (w + 6) % 7; // transforma domingo(0) em 6 e segunda(1) em 0
  }, [startOfMonth]);

  const ordersByDay = useMemo(() => {
    const map: Record<number, ServiceOrder[]> = {};
    serviceOrders.forEach((so) => {
      if (!so.dueDate) return;
      const d = new Date(so.dueDate);
      if (d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear()) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(so);
      }
    });
    return map;
  }, [serviceOrders, currentMonth]);

  const nextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  };

  const prevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d);
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="service-orders-page" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Calendário de Ordens de Serviço</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" onClick={prevMonth}>◀ Mês anterior</Button>
          <Card><div style={{ padding: '0.5rem 0.75rem' }}>{monthLabel}</div></Card>
          <Button variant="outline" onClick={nextMonth}>Mês seguinte ▶</Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Erro" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        {isLoading ? (
          <div className="loading-container">
            <Spinner />
            <p>Carregando calendário...</p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((w) => (
                <div key={w} style={{ textAlign: 'center', fontWeight: 600 }}>{w}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
              {Array.from({ length: firstWeekdayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} style={{ minHeight: '100px' }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const items = ordersByDay[day] || [];
                return (
                  <div key={`day-${day}`} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.5rem', minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{String(day).padStart(2, '0')}</strong>
                      {items.length > 0 && <Badge variant="info" size="sm">{items.length}</Badge>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {items.map((so) => (
                        <div key={so.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Badge variant={getStatusVariant(so.status)} size="sm">{so.status}</Badge>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{so.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ServiceOrdersCalendarPage;