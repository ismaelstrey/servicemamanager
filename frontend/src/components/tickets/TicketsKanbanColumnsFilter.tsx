import React from 'react'
import styled from 'styled-components'
import { Button, Dropdown } from '../ui'
import Checkbox from '../ui/Checkbox'

interface TicketsKanbanColumnsFilterProps {
  availableColumns: string[]
  selectedColumns: string[]
  statusLabels: Record<string, string>
  onToggle: (column: string) => void
  onSelectAll: () => void
  onHideDone: () => void
}

const FilterContainer = styled.div`
  display: inline-flex;
  align-items: center;
`

const Menu = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing?.xs || '0.5rem'};
  min-width: 220px;
`

const ActionsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing?.xs || '0.5rem'};
  justify-content: flex-end;
`

const TicketsKanbanColumnsFilter: React.FC<TicketsKanbanColumnsFilterProps> = ({
  availableColumns,
  selectedColumns,
  statusLabels,
  onToggle,
  onSelectAll,
  onHideDone,
}) => {
  return (
    <FilterContainer>
      <Dropdown trigger={<Button variant="secondary" size="sm">Colunas</Button>} closeOnClick={false}>
        <Menu>
          {availableColumns.map((col) => (
            <Checkbox
              key={col}
              label={statusLabels[col] ?? col}
              checked={selectedColumns.includes(col)}
              onChange={() => onToggle(col)}
              size="sm"
            />
          ))}
          <ActionsRow>
            <Button variant="secondary" size="sm" onClick={onSelectAll}>Todas</Button>
            <Button variant="secondary" size="sm" onClick={onHideDone}>Ocultar concluídas</Button>
          </ActionsRow>
        </Menu>
      </Dropdown>
    </FilterContainer>
  )
}

export default TicketsKanbanColumnsFilter

