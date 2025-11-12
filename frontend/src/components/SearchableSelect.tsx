import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

type Option = { value: string | number; label: string };

export interface SearchableSelectProps {
  placeholder?: string;
  value?: string | number;
  onChange: (value?: string | number) => void;
  fetchOptions: (search: string) => Promise<Option[]>;
}

// Estilos consistentes com o sistema de design (dark/light)
const Container = styled.div`
  position: relative;
  width: 100%;
`;

const InputBox = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.input.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: ${({ theme }) => theme.animations.transition.interactive};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.secondary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: ${({ theme }) => theme.shadows.focus.primary};
    background: ${({ theme }) => (theme.mode === 'dark' ? theme.colors.background.tertiary : theme.colors.background.primary)};
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: ${({ theme }) => theme.zIndex.context.form.dropdown};
  background: ${({ theme }) => theme.colors.surface || theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  box-shadow: ${({ theme }) => theme.shadows.component.dropdown.default};
  max-height: 240px;
  overflow: auto;
`;

const Message = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const OptionButton = styled.button<{ $selected?: boolean }>`
  display: block;
  width: 100%;
  text-align: left;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ $selected, theme }) =>
    $selected
      ? (theme.mode === 'dark' ? theme.colors.alpha.white[5] : theme.colors.background.muted || '#f3f4f6')
      : 'transparent'};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 0;
  cursor: pointer;
  transition: ${({ theme }) => theme.animations.transition.colors};

  &:hover {
    background: ${({ theme }) => (theme.mode === 'dark' ? theme.colors.alpha.white[10] : theme.colors.background.tertiary)};
  }
`;

const ClearButton = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.danger.main};
  background: transparent;
  border: 0;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  transition: ${({ theme }) => theme.animations.transition.background};

  &:hover {
    background: ${({ theme }) => (theme.mode === 'dark' ? theme.colors.alpha.white[5] : theme.colors.error[50])};
  }
`;

export const SearchableSelect: React.FC<SearchableSelectProps> = ({ placeholder, value, onChange, fetchOptions }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const opts = await fetchOptions(search);
        if (!cancelled) setOptions(opts);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [search, fetchOptions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Container ref={containerRef}>
      <InputBox
        placeholder={placeholder || 'Buscar...'}
        value={search}
        onFocus={() => setOpen(true)}
        onChange={(e) => setSearch(e.target.value)}
      />
      {open && (
        <Dropdown>
          {loading ? (
            <Message>Carregando...</Message>
          ) : options.length === 0 ? (
            <Message>Sem resultados</Message>
          ) : (
            options.map((opt) => (
              <OptionButton
                key={`${opt.value}`}
                type="button"
                $selected={String(value) === String(opt.value)}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </OptionButton>
            ))
          )}
          {value !== undefined && (
            <ClearButton
              type="button"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              Limpar seleção
            </ClearButton>
          )}
        </Dropdown>
      )}
    </Container>
  );
};

export default SearchableSelect;