import React from 'react'
import styled, { keyframes } from 'styled-components'
import SearchableSelect from '../SearchableSelect'
import { Input, Button, Tooltip } from '../ui'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface ReportsFiltersProps {
  startDate: string
  endDate: string
  status: string
  tag: string
  assigneeId: string
  customerId: string
  priority: string
  setStartDate: (v: string) => void
  setEndDate: (v: string) => void
  setStatus: (v: string) => void
  setTag: (v: string) => void
  setAssigneeId: (v: string) => void
  setCustomerId: (v: string) => void
  setPriority: (v: string) => void
  searchCustomers: (q: string, page: number, limit: number) => Promise<{ items: Array<{ id: number; name: string; email?: string }> }>
  onApply?: () => void
  onClear?: () => void
}

const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  startDate,
  endDate,
  status,
  tag,
  assigneeId,
  customerId,
  priority,
  setStartDate,
  setEndDate,
  setStatus,
  setTag,
  setAssigneeId,
  setCustomerId,
  setPriority,
  searchCustomers,
  onApply,
  onClear,
}) => {
  // Controle de exibição dos filtros: ocultos por padrão
  const [collapsed, setCollapsed] = React.useState<boolean>(true)
  return (
    <FiltersCard >
      <HeaderRow>
        <SectionHeader>Relatórios — Filtros</SectionHeader>
        {/* Botão de toggle minimalista com ícone e tooltip */}
        <Tooltip content={collapsed ? 'Mostrar filtros' : 'Ocultar filtros'} placement="bottom">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Mostrar filtros' : 'Ocultar filtros'}
            title={collapsed ? 'Mostrar filtros' : 'Ocultar filtros'}
            leftIcon={collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            children=""
          />
        </Tooltip>
      </HeaderRow>

      {!collapsed && (
        <>
          <FiltersGrid>
            <Field>
              <Label>Data inicial</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e: any) => setStartDate(e.target.value)}
                variant="outlined"
              />
            </Field>
            <Field>
              <Label>Data final</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e: any) => setEndDate(e.target.value)}
                variant="outlined"
              />
            </Field>
            <Field>
              <Button variant="primary" onClick={() => onApply?.()}>Aplicar</Button>
            </Field>
          </FiltersGrid>

          <Divider />
          <SubsectionHeader>Filtros avançados</SubsectionHeader>

          <AdvancedFiltersGrid>
            <Field>
              <Label>Status</Label>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Todos</option>
                <option value="open">Aberto</option>
                <option value="assigned">Atribuído</option>
                <option value="in_progress">Em andamento</option>
                <option value="pending">Pendente</option>
                <option value="resolved">Resolvido</option>
                <option value="closed">Fechado</option>
                <option value="cancelled">Cancelado</option>
              </Select>
            </Field>
            <Field>
              <Label>Tag</Label>
              <Input type="text" value={tag} onChange={(e: any) => setTag(e.target.value)} placeholder="Ex: urgência, cliente VIP" />
            </Field>
            <Field>
              <Label>Técnico (ID)</Label>
              <Input type="number" value={assigneeId} onChange={(e: any) => setAssigneeId(e.target.value)} placeholder="Ex: 12" />
            </Field>
            <Field>
              <Label>Cliente</Label>
              <SelectWrapper>
                <SearchableSelect
                  placeholder="Digite para buscar clientes"
                  value={customerId || undefined}
                  onChange={(val) => setCustomerId(val ? String(val) : '')}
                  fetchOptions={async (q) => {
                    const res = await searchCustomers(q, 1, 10)
                    return res.items.map((c) => ({ value: c.id, label: `${c.name} · ${c.email ?? ''}`.trim() }))
                  }}
                />
              </SelectWrapper>
            </Field>
            <Field>
              <Label>Prioridade</Label>
              <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="">Todas</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </Select>
            </Field>
            <ActionsInline>
              <Button variant="primary" onClick={() => onApply?.()}>Buscar</Button>
              <Button variant="secondary" onClick={() => onClear?.()}>Limpar</Button>
            </ActionsInline>
          </AdvancedFiltersGrid>
        </>
      )}
    </FiltersCard>
  )
}

export default ReportsFilters

// Styled wrappers locais ao componente
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const FiltersCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.card.md};
  box-shadow: ${({ theme }) => theme.shadows.component.card.default};
  padding: ${({ theme }) => theme.spacing.component.card.md};
  animation: ${fadeInUp} 240ms ease-out both;
  transition: ${({ theme }) => theme.animations.transition.interactive};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.component.card.hover};
    transform: translateY(-1px);
  }
`

const SectionHeader = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  color: ${({ theme }) => theme.colors.text.primary};
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
`

const SubsectionHeader = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: ${({ theme }) => theme.spacing.md} 0 ${({ theme }) => theme.spacing.sm} 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const Divider = styled.hr`
  border: none;
  height: 1px;
  background: ${({ theme }) => theme.colors.border.secondary};
  margin: ${({ theme }) => theme.spacing.md} 0;
`

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing?.lg || '1.25rem'};
  align-items: end;
`

const AdvancedFiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing?.lg || '1.25rem'};
  align-items: end;
  margin-top: ${({ theme }) => theme.spacing?.sm || '0.75rem'};
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: ${fadeInUp} 260ms ease-out both;
`

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
`

const Select = styled.select`
  width: 100%;
  appearance: none;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: ${({ theme }) => theme.borders.radius.input.md};
  padding: 0.6rem 0.8rem;
  background: ${({ theme }) => (theme.mode === 'dark' ? theme.colors.background.tertiary : theme.colors.background.primary)};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: ${({ theme }) => theme.animations.transition.interactive};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.primary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.ring};
    background: ${({ theme }) => (theme.mode === 'dark' ? theme.colors.background.tertiary : theme.colors.background.primary)};
  }
`

const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  &:focus-within {
    filter: drop-shadow(0 0 0 rgba(0,0,0,0));
  }
`

const ActionsInline = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing?.xs || '0.5rem'};
`