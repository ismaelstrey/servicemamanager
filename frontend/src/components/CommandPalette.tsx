import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchBox, Button, Badge } from './ui'
import useGlobalSearch from '../hooks/useGlobalSearch'

// Componente Command Palette com atalho Ctrl+K
// Permite busca rápida em tickets e equipamentos e navegação
export const CommandPalette: React.FC = () => {
  const navigate = useNavigate()
  const { query, setQuery, results, loading, error, refresh } = useGlobalSearch('')
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80, zIndex: 1000
        }}
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 'min(720px, 92vw)', background: 'var(--surface, #111827)', borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)', border: '1px solid var(--border, #374151)'
          }}
        >
          <div style={{ padding: 12, borderBottom: '1px solid var(--border, #374151)' }}>
            <SearchBox
              value={query}
              onChange={(e: any) => setQuery(e.target.value)}
              onSearch={() => {/* handled by Enter */}}
              onClear={() => setQuery('')}
              placeholder="Buscar globalmente (Ctrl+K)"
              ref={inputRef as any}
            />
            {error && (
              <div style={{ color: '#ef4444', marginTop: 8 }}>Erro: {error}</div>
            )}
          </div>

          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {/* Tickets */}
            {grouped.tickets.length > 0 && (
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>Tickets</div>
                {grouped.tickets.map((item, idx) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => { navigate(item.url); setIsOpen(false) }}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                      background: activeIndex === idx ? 'rgba(59,130,246,0.12)' : 'transparent'
                    }}
                  >
                    <div style={{ display: 'grid' }}>
                      <span style={{ fontWeight: 600 }}>{item.title}</span>
                      {item.subtitle && (
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>{item.subtitle}</span>
                      )}
                    </div>
                    <Badge variant="info">Abrir</Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Equipamentos */}
            {grouped.equipments.length > 0 && (
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>Equipamentos</div>
                {grouped.equipments.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => { navigate(item.url); setIsOpen(false) }}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', borderRadius: 8, cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'grid' }}>
                      <span style={{ fontWeight: 600 }}>{item.title}</span>
                      {item.subtitle && (
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>{item.subtitle}</span>
                      )}
                    </div>
                    <Badge variant="info">Abrir</Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Senhas (placeholder) */}
            {grouped.passwords.length === 0 && (
              <div style={{ padding: '10px 12px', color: '#9CA3AF' }}>
                Dica: Integre o serviço de senhas para aparecer aqui.
              </div>
            )}
          </div>

          <div style={{ padding: 10, borderTop: '1px solid var(--border, #374151)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{loading ? 'Indexando...' : `${results.length} resultados`}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Fechar (Esc)</Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CommandPalette