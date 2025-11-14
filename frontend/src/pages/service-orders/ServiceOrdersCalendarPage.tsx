import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Card, Button, Badge, Alert, LogoLoader } from '../../components/ui';
import { ApiService } from '../../services/api';
import { useProviderContext } from '../../contexts/providerContext';
import { decodeJwt } from '../../utils/jwt';
import type { ServiceOrder } from '../../services/serviceOrderService';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MonthBox = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
` as any;

const WeekHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  text-align: center;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: ${({ theme }) => theme.spacing.xs};
`;

const DayCell = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: ${({ theme }) => theme.spacing.xs};
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

// Página de calendário de Ordens de Serviço com navegação mensal
const ServiceOrdersCalendarPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [providerId, setProviderId] = useState<number | undefined>(undefined);
  const { selectedProviderId } = useProviderContext();

  useEffect(() => {
    const pid = selectedProviderId == null ? undefined : Number(selectedProviderId);
    setProviderId(Number.isFinite(pid as number) ? pid : undefined);
  }, [selectedProviderId]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!providerId || providerId <= 0) {
          throw new Error('providerId obrigatório para calendário');
        }
        const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const formatDate = (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };
        const res = await ApiService.get<ServiceOrder[]>(
          '/service-orders/calendar',
          { params: { id: providerId, from: formatDate(start), to: formatDate(end) } }
        );
        setServiceOrders(res.data || []);
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || 'Erro ao carregar ordens de serviço para o calendário.';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [providerId, currentMonth]);

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
      if (!so.scheduledDate) return;
      const d = new Date(so.scheduledDate);
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
    <PageWrapper>
      <HeaderRow>
        <h1 style={{ margin: 0 }}>Calendário de Ordens de Serviço</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" onClick={prevMonth}>◀ Mês anterior</Button>
          <MonthBox>{monthLabel}</MonthBox>
          <Button variant="outline" onClick={nextMonth}>Mês seguinte ▶</Button>
        </div>
      </HeaderRow>

      {error && (
        <Alert variant="danger" title="Erro" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <LogoLoader fullscreen message="Carregando calendário..." />
      ) : (
        <Card>
          <div>
            <WeekHeader>
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((w) => (
                <div key={w}>{w}</div>
              ))}
            </WeekHeader>
            <CalendarGrid>
              {Array.from({ length: firstWeekdayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} style={{ minHeight: '100px' }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const items = ordersByDay[day] || [];
                return (
                  <DayCell key={`day-${day}`}>
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
                  </DayCell>
                );
              })}
            </CalendarGrid>
          </div>
        </Card>
      )}
    </PageWrapper>
  );
};

export default ServiceOrdersCalendarPage;
