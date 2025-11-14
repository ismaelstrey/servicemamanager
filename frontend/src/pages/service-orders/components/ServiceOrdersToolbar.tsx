import React from 'react';
import styled from 'styled-components';
import { Button, Dropdown, DropdownItem } from '../../../components/ui';
import { Input } from '../../../components/ui/Input';
import { Search as SearchIcon } from 'lucide-react';

type Option = { value: string; label: string };

interface Props {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  onClearFilters: () => void;
  statusOptions: Option[];
  priorityOptions: Option[];
}

const ServiceOrdersToolbar: React.FC<Props> = ({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  onClearFilters,
  statusOptions,
  priorityOptions,
}) => {
  return (
    <TableToolbar>
      <TableToolbarFilters>
        <Input
          placeholder="Buscar por título, cliente ou descrição..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          leftIcon={<SearchIcon size={16} />}
        />

        <Dropdown>
          <Button variant="outline">
            {statusOptions.find(opt => opt.value === statusFilter)?.label}
          </Button>
          {statusOptions.map(option => (
            <DropdownItem
              key={option.value}
              onClick={() => onStatusFilterChange(option.value)}
            >
              {option.label}
            </DropdownItem>
          ))}
        </Dropdown>

        <Dropdown>
          <Button variant="outline">
            {priorityOptions.find(opt => opt.value === priorityFilter)?.label}
          </Button>
          {priorityOptions.map(option => (
            <DropdownItem
              key={option.value}
              onClick={() => onPriorityFilterChange(option.value)}
            >
              {option.label}
            </DropdownItem>
          ))}
        </Dropdown>
      </TableToolbarFilters>

      <TableToolbarActions>
        <Button
          variant="outline"
          onClick={onClearFilters}
        >
          Limpar Filtros
        </Button>
      </TableToolbarActions>
    </TableToolbar>
  );
};

const TableToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const TableToolbarFilters = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const TableToolbarActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export default ServiceOrdersToolbar;