import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

const Bubble = styled.div<{ $placement: TooltipPlacement }>`
  position: fixed;
  white-space: nowrap;
  background: ${({ theme }) => theme.colors.background.overlay};
  color: ${({ theme }) =>
    theme.mode === 'dark'
      ? theme.colors.text.primary
      : theme.colors.text.inverse};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: ${({ theme }) => theme.zIndex.tooltip};

  ${({ $placement }) => $placement === 'top' && css`transform: translate(-50%, -100%);`}
  ${({ $placement }) => $placement === 'bottom' && css`transform: translate(-50%, 0%);`}
  ${({ $placement }) => $placement === 'left' && css`transform: translate(-100%, -50%);`}
  ${({ $placement }) => $placement === 'right' && css`transform: translate(0%, -50%);`}
`;

export const Tooltip: React.FC<TooltipProps> = ({ content, placement = 'top', children }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offset = 8;
    switch (placement) {
      case 'top':
        setCoords({ top: rect.top - offset, left: rect.left + rect.width / 2 });
        break;
      case 'bottom':
        setCoords({ top: rect.bottom + offset, left: rect.left + rect.width / 2 });
        break;
      case 'left':
        setCoords({ top: rect.top + rect.height / 2, left: rect.left - offset });
        break;
      case 'right':
      default:
        setCoords({ top: rect.top + rect.height / 2, left: rect.right + offset });
        break;
    }
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    window.addEventListener('blur', () => setOpen(false));
    return () => {
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, placement]);

  return (
    <Wrapper ref={ref} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      {open && createPortal(
        <Bubble $placement={placement} role="tooltip" style={{ top: coords.top, left: coords.left }}>
          {content}
        </Bubble>,
        document.body
      )}
    </Wrapper>
  );
};

export default Tooltip;