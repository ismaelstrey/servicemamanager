import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled, { css, keyframes } from 'styled-components';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  z-index: 1000;
`;

const Dialog = styled.div<{ $size: ModalSize }>`
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  width: 100%;
  outline: none;
  animation: ${fadeIn} 0.2s ease;

  ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return css`max-width: 420px;`;
      case 'lg':
        return css`max-width: 800px;`;
      case 'xl':
        return css`max-width: 960px;`;
      case 'full':
        return css`max-width: 100%; height: auto;`;
      default:
        return css`max-width: 600px;`;
    }
  }}
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const TitleEl = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.ui.subtitle.fontSize};
  font-weight: ${({ theme }) => theme.typography.ui.subtitle.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Close = styled.button`
  background: transparent;
  border: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const BodyEl = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const FooterEl = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      modalRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleModalClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <Overlay onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
      <Dialog ref={modalRef} $size={size} className={className} onClick={handleModalClick} tabIndex={-1}>
        {title && (
          <ModalHeader onClose={onClose} showCloseButton={showCloseButton}>
            <TitleEl id="modal-title">{title}</TitleEl>
          </ModalHeader>
        )}
        {children}
      </Dialog>
    </Overlay>
  );

  return createPortal(modalContent, document.body);
};

export const ModalHeader: React.FC<ModalHeaderProps> = ({ children, className = '', onClose, showCloseButton = true }) => {
  return (
    <Header className={className}>
      <div>{children}</div>
      {showCloseButton && onClose && (
        <Close onClick={onClose} aria-label="Fechar modal" type="button">×</Close>
      )}
    </Header>
  );
};

export const ModalBody: React.FC<ModalBodyProps> = ({ children, className = '' }) => {
  return <BodyEl className={className}>{children}</BodyEl>;
};

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className = '' }) => {
  return <FooterEl className={className}>{children}</FooterEl>;
};



export default Modal;