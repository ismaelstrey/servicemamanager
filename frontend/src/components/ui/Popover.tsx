import React, { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverProps {
  trigger: React.ReactElement<{ onClick?: React.MouseEventHandler<any> }>;
  content: React.ReactNode;
  placement?: PopoverPlacement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Panel = styled.div<{ placement: PopoverPlacement }>`
  position: absolute;
  min-width: 200px;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: ${({ theme }) => theme.zIndex.popover};

  ${({ placement }) => placement === 'top' && css`bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 8px;`}
  ${({ placement }) => placement === 'bottom' && css`top: 100%; left: 50%; transform: translateX(-50%); margin-top: 8px;`}
  ${({ placement }) => placement === 'left' && css`right: 100%; top: 50%; transform: translateY(-50%); margin-right: 8px;`}
  ${({ placement }) => placement === 'right' && css`left: 100%; top: 50%; transform: translateY(-50%); margin-left: 8px;`}
`;

export const Popover: React.FC<PopoverProps> = ({ trigger, content, placement = 'bottom', open, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === 'boolean';
  const actualOpen = isControlled ? open! : internalOpen;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        isControlled ? onOpenChange?.(false) : setInternalOpen(false);
      }
    };
    if (actualOpen) {
      document.addEventListener('mousedown', onDocClick);
    }
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [actualOpen, isControlled, onOpenChange]);

  const handleToggle = () => {
    if (isControlled) onOpenChange?.(!open);
    else setInternalOpen((v) => !v);
  };

  return (
    <Wrapper ref={ref}>
      {React.cloneElement(trigger, { onClick: handleToggle })}
      {actualOpen && <Panel placement={placement}>{content}</Panel>}
    </Wrapper>
  );
};

export default Popover;