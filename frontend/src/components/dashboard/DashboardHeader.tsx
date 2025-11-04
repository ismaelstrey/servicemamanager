import React from 'react'
import styled from 'styled-components'
import { Select, Button, Alert } from '../ui'
import type { ProviderListItem } from '../../services/providerService'

// Componente de cabeçalho do Dashboard
// Renderiza título/subtítulo, filtros (provedor/período), ação de exportar CSV
// e alerta de "Visão Global". Usa styled-components com tokens do theme
// para suportar customização e tema claro/escuro.
export interface DashboardHeaderProps {
  title: string
  subtitle: string
  providers: ProviderListItem[]
  selectedProviderId: string | number
  onProviderChange: (value: string) => void
  period: '7d' | '30d' | '3m' | '12m'
  onPeriodChange: (value: '7d' | '30d' | '3m' | '12m') => void
  onExportCsv: () => void
  onCreateProvider: () => void
  className?: string
}

// Container principal do header do dashboard
const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} 0;
`

// Grupo de títulos
const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

// Título principal
const Title = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`

// Subtítulo
const Subtitle = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`

// Linha de controles/filtros e ações
const ControlsRow = styled.div`
  display: flex;
  align-items: flex-end; /* alinha pela base para compensar labels dos selects */
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`

// Larguras mínimas para Selects (melhora UX em wrap)
const SelectWrapper = styled.div<{ $minWidth?: number }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* garante base alinhada com o botão */
  min-width: ${({ $minWidth }) => ($minWidth ? `${$minWidth}px` : '200px')};
`

// Área do alerta
const InfoArea = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
`

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  providers,
  selectedProviderId,
  onProviderChange,
  period,
  onPeriodChange,
  onExportCsv,
  onCreateProvider,
  className,
}) => {
  const isGlobal = String(selectedProviderId) === 'global'

  return (
    <HeaderContainer className={className ?? 'dashboard__header'}>
      <TitleGroup>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </TitleGroup>

      <ControlsRow>
        <SelectWrapper $minWidth={240}>
          <Select
            label="Contexto"
            size="sm"
            value={isGlobal ? 'global' : String(selectedProviderId)}
            onChange={(e) => onProviderChange((e.target as HTMLSelectElement).value)}
          >
            <option value="global">Visão Global</option>
            {providers.map((p) => (
              <option key={p.id} value={String(p.id)}>{p.name}</option>
            ))}
          </Select>
        </SelectWrapper>

        <SelectWrapper $minWidth={200}>
          <Select
            label="Período"
            size="sm"
            value={period}
            onChange={(e) => onPeriodChange((e.target as HTMLSelectElement).value as '7d' | '30d' | '3m' | '12m')}
          >
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
            <option value="3m">3 meses</option>
            <option value="12m">12 meses</option>
          </Select>
        </SelectWrapper>

        <Button variant="secondary" onClick={onExportCsv}>
          Exportar Relatório (CSV)
        </Button>

        {providers.length === 0 && (
          <Button variant="primary" onClick={onCreateProvider}>
            Criar Provedor
          </Button>
        )}
      </ControlsRow>

      {isGlobal && (
        <InfoArea>
          <Alert variant="info" title="Visão Global">
            Você está visualizando dados gerais. Selecione um provedor para acessar o workspace específico.
          </Alert>
        </InfoArea>
      )}
    </HeaderContainer>
  )
}

export default DashboardHeader