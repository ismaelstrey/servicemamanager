import React, { useState } from 'react';
import styled from 'styled-components';

export interface AccordionItemProps {
  id: string;
  title: React.ReactNode;
  children: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItemProps[];
  multiple?: boolean;
  defaultOpenIds?: string[];
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  background: ${({ theme }) => theme.colors.background.secondary};
`;

const Item = styled.div`
  & + & { border-top: 1px solid ${({ theme }) => theme.colors.border.primary}; }
`;

const Header = styled.button`
  width: 100%;
  text-align: left;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  border: 0;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.ui.body.fontSize};
  font-weight: ${({ theme }) => theme.typography.ui.body.fontWeight};
`;

const Panel = styled.div`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Accordion: React.FC<AccordionProps> = ({ items, multiple = false, defaultOpenIds = [] }) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const isOpen = prev.includes(id);
      if (multiple) return isOpen ? prev.filter((x) => x !== id) : [...prev, id];
      return isOpen ? [] : [id];
    });
  };

  return (
    <Container>
      {items.map((it) => {
        const isOpen = openIds.includes(it.id);
        return (
          <Item key={it.id}>
            <Header aria-expanded={isOpen} onClick={() => toggle(it.id)}>
              {it.title}
            </Header>
            {isOpen && <Panel>{it.children}</Panel>}
          </Item>
        );
      })}
    </Container>
  );
};

export default Accordion;