import React, { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  placement?: TooltipPlacement;
  children: React.ReactElement;
}

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Bubble = styled.div<{ placement: TooltipPlacement }>`
  position: absolute;
  white-space: nowrap;
  background: ${({ theme }) => theme.colors.background.overlay};
  color: ${({ theme }) => theme.colors.text.inverse};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: ${({ theme }) => theme.zIndex.tooltip};

  ${({ placement }) => placement === 'top' && css`bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 8px;`}
  ${({ placement }) => placement === 'bottom' && css`top: 100%; left: 50%; transform: translateX(-50%); margin-top: 8px;`}
  ${({ placement }) => placement === 'left' && css`right: 100%; top: 50%; transform: translateY(-50%); margin-right: 8px;`}
  ${({ placement }) => placement === 'right' && css`left: 100%; top: 50%; transform: translateY(-50%); margin-left: 8px;`}
`;

export const Tooltip: React.FC<TooltipProps> = ({ content, placement = 'top', children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = () => setOpen(false);
    if (open) {
      document.addEventListener('scroll', close, true);
      window.addEventListener('blur', close);
    }
    return () => {
      document.removeEventListener('scroll', close, true);
      window.removeEventListener('blur', close);
    };
  }, [open]);

  return (
    <Wrapper ref={ref} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      {open && <Bubble placement={placement} role="tooltip">{content}</Bubble>}
    </Wrapper>
  );
};

export default Tooltip;