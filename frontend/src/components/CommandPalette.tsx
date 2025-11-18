import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import styled from 'styled-components'
import { SearchBox, Button, Badge } from './ui'
import { useTicketCreateModal } from '../contexts/ticketCreateModalContext'
import useGlobalSearch from '../hooks/useGlobalSearch'

// Componente Command Palette com atalho Ctrl+K
// Permite busca rápida em tickets e equipamentos e navegação
export const CommandPalette: React.FC = () => {
  const navigate = useNavigate()
  const { query, setQuery, results, loading, error, refresh } = useGlobalSearch('')
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const ticketModal = useTicketCreateModal()

  // Atalho de teclado: Ctrl+K (Windows/Linux) e Meta+K (macOS)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCtrlK = e.ctrlKey && e.key.toLowerCase() === 'k'
      const isMetaK = e.metaKey && e.key.toLowerCase() === 'k'
      if (isCtrlK || isMetaK) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Foco no input quando abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      refresh().catch(() => {})
    } else {
      setQuery('')
      setActiveIndex(0)
    }
  }, [isOpen])

  // Navegação pela lista com teclado
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const item = results[activeIndex]
        if (item) {
          navigate(item.url)
          setIsOpen(false)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', keyHandler)
    return () => window.removeEventListener('keydown', keyHandler)
  }, [isOpen, results, activeIndex, navigate])

  const grouped = useMemo(() => {
    const groups: Record<string, typeof results> = { tickets: [], equipments: [], passwords: [] }
    results.forEach((r) => {
      if (r.type === 'ticket') groups.tickets.push(r)
      else if (r.type === 'equipment') groups.equipments.push(r)
      else if (r.type === 'password') groups.passwords.push(r)
    })
    return groups
  }, [results])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <Backdrop
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
      >
        <Dialog
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
       >
          <Header>
            <SearchBox
              value={query}
              onChange={(e: any) => setQuery(e.target.value)}
              onSearch={() => {}}
              onClear={() => setQuery('')}
              placeholder="Buscar globalmente (Ctrl+K)"
              ref={inputRef as any}
            />
            {error && (
              <ErrorMsg>Erro: {error}</ErrorMsg>
            )}
          </Header>

          <ScrollArea>
            {grouped.tickets.length > 0 && (
              <Group>
                <GroupTitle>Tickets</GroupTitle>
                {grouped.tickets.map((item, idx) => (
                  <ItemRow
                    key={`${item.type}-${item.id}`}
                    onClick={() => { navigate(item.url); setIsOpen(false) }}
                    $active={activeIndex === idx}
                  >
                    <ItemContent>
                      <ItemTitle>{item.title}</ItemTitle>
                      {item.subtitle && (
                        <ItemSubtitle>{item.subtitle}</ItemSubtitle>
                      )}
                    </ItemContent>
                    <Badge variant="info">Abrir</Badge>
                  </ItemRow>
                ))}
              </Group>
            )}

            {grouped.equipments.length > 0 && (
              <Group>
                <GroupTitle>Equipamentos</GroupTitle>
                {grouped.equipments.map((item) => (
                  <ItemRow
                    key={`${item.type}-${item.id}`}
                    onClick={() => { navigate(item.url); setIsOpen(false) }}
                  >
                    <ItemContent>
                      <ItemTitle>{item.title}</ItemTitle>
                      {item.subtitle && (
                        <ItemSubtitle>{item.subtitle}</ItemSubtitle>
                      )}
                    </ItemContent>
                    <Badge variant="info">Abrir</Badge>
                  </ItemRow>
                ))}
              </Group>
            )}

            {grouped.passwords.length === 0 && (
              <Placeholder>
                Dica: Integre o serviço de senhas para aparecer aqui.
              </Placeholder>
            )}
          </ScrollArea>

          <Footer>
            <FooterLeft>{loading ? 'Indexando...' : `${results.length} resultados`}</FooterLeft>
            <FooterRight>
              <Button variant="primary" onClick={() => { ticketModal.open(); setIsOpen(false) }}>Criar Ticket</Button>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Fechar (Esc)</Button>
            </FooterRight>
          </Footer>
        </Dialog>
      </Backdrop>
    </AnimatePresence>
  )
}

export default CommandPalette

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.background.overlay};
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  z-index: ${({ theme }) => theme.zIndex.context.overlay.backdrop};
`;

const Dialog = styled(motion.div)`
  width: min(720px, 92vw);
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const Header = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const ErrorMsg = styled.div`
  color: ${({ theme }) => theme.colors.error.main};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ScrollArea = styled.div`
  max-height: 420px;
  overflow-y: auto;
`;

const Group = styled.div`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
`;

const GroupTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ItemRow = styled.div<{ $active?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  cursor: pointer;
  background: ${({ $active, theme }) => ($active ? theme.colors.primary[50] : 'transparent')};
`;

const ItemContent = styled.div`
  display: grid;
`;

const ItemTitle = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const ItemSubtitle = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Placeholder = styled.div`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Footer = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
  display: flex;
  justify-content: space-between;
`;

const FooterLeft = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const FooterRight = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;