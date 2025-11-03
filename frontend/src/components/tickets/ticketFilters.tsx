import { Card, CardBody, Select, Button } from '../ui';
import Input from '../atoms/Input/Input';
import styled from 'styled-components';
import type { TicketStatus, TicketCategory } from '../../types/ticket';
import type { Priority } from '../../types/common';

// Componente de filtros da lista de tickets
// Renderiza os controles de busca e seleção de filtros e emite callbacks para o container
export interface TicketsFiltersProps {
    filters: {
        search: string;
        status: TicketStatus | 'all';
        priority: Priority | 'all';
        category: TicketCategory | 'all';
    };
    hasActiveFilters: boolean;
    onChange: (key: 'search' | 'status' | 'priority' | 'category', value: string) => void;
    onClear: () => void;
}

// Estilos baseados em tema para suportar dark/light mode
const FiltersCard = styled(Card)`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  /* Aumentar especificidade para garantir override de estilos globais */
  && {
    box-shadow: ${({ theme }) => theme.shadows.none};
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const FiltersRow = styled.div`
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;

  & > * {
    width: 100%;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

// Select minimalista para manter consistência visual nos filtros
// (Input passa a usar a versão estilizada dos átomos, que posiciona ícones internamente)

const MinimalSelect = styled(Select)`
  && {
    width: 100%;
    border-radius: ${({ theme }) => theme.borders.radius.md};
    border: 1px solid ${({ theme }) => theme.colors.border.primary};
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    min-height: 40px;
    box-shadow: none;
  }
`;

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

// Componente TicketFilters: controla os filtros de listagem de tickets
// Usa styled-components e tokens de tema para responder ao dark/light mode
export function TicketFilters({ filters, hasActiveFilters, onChange, onClear }: TicketsFiltersProps) {
    return (
        <FiltersCard variant="outlined">
            <CardBody>
                <Toolbar>
                    <FiltersRow>
                        <Input
                            placeholder="Buscar por título, número ou cliente..."
                            value={filters.search}
                            onChange={(e) => onChange('search', e.target.value)}
                            leftIcon="🔍"
                            size="md"
                            variant="default"
                            fullWidth
                        />
                        <MinimalSelect
                            value={filters.status}
                            onChange={(e) => onChange('status', e.target.value)}
                            size="md"
                            variant="outlined"
                            fullWidth
                        >
                            <option value="all">Todos os Status</option>
                            {Object.entries(statusLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </MinimalSelect>
                        <MinimalSelect
                            value={filters.priority}
                            onChange={(e) => onChange('priority', e.target.value)}
                            size="md"
                            variant="outlined"
                            fullWidth
                        >
                            <option value="all">Todas as Prioridades</option>
                            {Object.entries(priorityLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </MinimalSelect>
                        <MinimalSelect
                            value={filters.category}
                            onChange={(e) => onChange('category', e.target.value)}
                            size="md"
                            variant="outlined"
                            fullWidth
                        >
                            <option value="all">Todas as Categorias</option>
                            {Object.entries(categoryLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </MinimalSelect>
                    </FiltersRow>
                    <ActionsRow>
                        {hasActiveFilters && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={onClear}
                            >
                                Limpar Filtros
                            </Button>
                        )}
                    </ActionsRow>
                </Toolbar>
            </CardBody>
        </FiltersCard>
    );
}

export default TicketFilters;