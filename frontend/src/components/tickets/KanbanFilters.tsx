import React from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Select, SearchBox } from '../ui'
import { Filter } from 'lucide-react'

interface KanbanFiltersProps {
  visible: boolean
  onToggle: () => void
  priority: 'all' | 'low' | 'medium' | 'high' | 'urgent' | 'critical'
  onPriorityChange: (value: 'all' | 'low' | 'medium' | 'high' | 'urgent' | 'critical') => void
  search: string
  onSearchChange: (value: string) => void
}

const Container = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const ToggleRow = styled.div`
  display: flex;
  justify-content: flex-end;
`

const Panel = styled(motion.div)`
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`

const Fields = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`

const KanbanFilters: React.FC<KanbanFiltersProps> = ({ visible, onToggle, priority, onPriorityChange, search, onSearchChange }) => {
  return (
    <Container>
      <ToggleRow>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          title="Filtros"
          leftIcon={<Filter size={16} />}
        >
          Filtros
        </Button>
      </ToggleRow>
      <AnimatePresence>
        {visible && (
          <Panel
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Fields>
              <Select

                size="md"
                value={priority}
                onChange={(e) => onPriorityChange((e.target as HTMLSelectElement).value as KanbanFiltersProps['priority'])}
              >
                <option value="all">Todas</option>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
                <option value="critical">Crítica</option>
              </Select>
              <SearchBox

                value={search}
                onChange={(e: any) => onSearchChange(e.target.value)}
                onSearch={() => { }}
                onClear={() => onSearchChange('')}
                placeholder="Buscar por título"
              />
            </Fields>
          </Panel>
        )}
      </AnimatePresence>
    </Container>
  )
}

export default KanbanFilters