import React from 'react'
import styled from 'styled-components'
import { Button, Badge, Dropdown, DropdownItem } from '../ui'

interface TicketsListActionsProps {
  viewMode: 'list' | 'grid'
  showFavoritesOnly: boolean
  presenceCount: number
  notificationCount: number
  onListView: () => void
  onGridView: () => void
  onKanban: () => void
  onToggleFavorites: () => void
  onExportCSV: () => void
  onExportExcel: () => void
  onExportPDF: () => void
  onNewTicket: () => void
}

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
`

const InlineGroup = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
`

const TicketsListActions: React.FC<TicketsListActionsProps> = ({
  viewMode,
  showFavoritesOnly,
  presenceCount,
  notificationCount,
  onListView,
  onGridView,
  onKanban,
  onToggleFavorites,
  onExportCSV,
  onExportExcel,
  onExportPDF,
  onNewTicket,
}) => {
  return (
    <ActionsContainer>
      <InlineGroup>
        <Button variant={viewMode === 'list' ? 'primary' : 'secondary'} size="sm" onClick={onListView}>Lista</Button>
        <Button variant={viewMode === 'grid' ? 'primary' : 'secondary'} size="sm" onClick={onGridView}>Grade</Button>
        <Button variant="secondary" size="sm" onClick={onKanban}>Kanban</Button>
        <Button variant={showFavoritesOnly ? 'primary' : 'secondary'} size="sm" onClick={onToggleFavorites}>
          {showFavoritesOnly ? 'Favoritos ✓' : 'Favoritos'}
        </Button>
        <Badge variant="secondary">👥 {presenceCount} online</Badge>
        <Badge variant="secondary">🔔 {notificationCount}</Badge>
      </InlineGroup>
      <InlineGroup>
        <Dropdown>
          <DropdownItem onClick={onExportCSV}>Exportar CSV</DropdownItem>
          <DropdownItem onClick={onExportExcel}>Exportar Excel</DropdownItem>
          <DropdownItem onClick={onExportPDF}>Exportar PDF</DropdownItem>
        </Dropdown>
        <Button variant="primary" onClick={onNewTicket} leftIcon="➕">
          Novo Ticket
        </Button>
      </InlineGroup>
    </ActionsContainer>
  )
}

export default TicketsListActions