import React from 'react';
import styled from 'styled-components';
import { Search as SearchIcon, X as ClearIcon } from 'lucide-react';

export interface SearchBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
}

const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  max-width: 480px;
`;

const IconLeft = styled(SearchIcon)`
  position: absolute;
  left: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const IconRight = styled(ClearIcon)`
  position: absolute;
  right: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  padding-left: 36px;
  padding-right: 36px;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  outline: none;
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: ${({ theme }) => theme.shadows.focus.primary};
  }
`;

// Componente SearchBox com suporte a forwardRef para permitir foco programático
// Comentário: Encaminha o ref para o input interno para facilitar o controle de foco.
export const SearchBox = React.forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ value, onChange, onSearch, onClear, placeholder = 'Buscar...', onKeyDown, ...rest }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.key === 'Enter') {
        onSearch?.(value);
      }
    };

    return (
      <Wrapper>
        <IconLeft size={18} />
        <Input
          ref={ref}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          {...rest}
        />
        {value && (
          <IconRight size={18} onClick={() => onClear ? onClear() : onChange?.({ target: { value: '' } } as unknown as React.ChangeEvent<HTMLInputElement>)} />
        )}
      </Wrapper>
    );
  }
);

export default SearchBox;
