import { useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { TicketService } from '../services/ticketService'
import { ApiService } from '../services/api'
import type { Ticket } from '../types/ticket'
import { useAuth } from './useAuth'
import { decodeJwt } from '../utils/jwt'

// Tipos de entidades suportadas pela busca global
export type GlobalEntityType = 'ticket' | 'equipment' | 'password'

export interface GlobalSearchItem {
  id: string | number
  type: GlobalEntityType
  title: string
  subtitle?: string
  url: string
  raw: any
}

export interface UseGlobalSearchResult {
  query: string
  setQuery: (v: string) => void
  loading: boolean
  error: string | null
  results: GlobalSearchItem[]
  refresh: () => Promise<void>
}

// Hook de busca global com fuzzy search usando Fuse.js
// Agrega tickets (globais) e equipamentos (por providerId do token)
// Senhas: placeholder vazio por enquanto até backend/serviço específico
export function useGlobalSearch(initialQuery: string = ''): UseGlobalSearchResult {
  const [query, setQuery] = useState<string>(initialQuery)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<GlobalSearchItem[]>([])

  // Autenticação para obter providerId do token
  const { token } = useAuth()
  const payload = useMemo(() => decodeJwt(token ?? undefined), [token])
  const providerId = payload?.providerId

  // Carrega dados básicos para indexação
  const loadBaseData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Tickets globais - primeira página com limite razoável
      const ticketsRes = await TicketService.getTicketsAll({}, 1, 100)
      const tickets = ticketsRes.data ?? []
      const ticketItems: GlobalSearchItem[] = (tickets as Ticket[]).map((t) => ({
        id: t.id,
        type: 'ticket',
        title: t.title ?? `Ticket #${t.id}`,
        subtitle: [t.category, t.status, t.priority].filter(Boolean).join(' • '),
        url: `/tickets/${t.id}`,
        raw: t,
      }))

      // Equipamentos por providerId (se disponível)
      let equipmentItems: GlobalSearchItem[] = []
      if (providerId) {
        try {
          const listRes = await ApiService.get<any>(`/providers/${providerId}/equipments`, { params: { limit: 100 } })
          const equipments = listRes?.data?.data ?? listRes?.data ?? []
          equipmentItems = (equipments as any[]).map((e) => ({
            id: e.id,
            type: 'equipment',
            title: e.name || e.label || `Equipamento #${e.id}`,
            subtitle: [e.type, e.serial, e.status].filter(Boolean).join(' • '),
            url: `/equipments`,
            raw: e,
          }))
        } catch (equipErr) {
          // Ignorar erro de equipamentos para não bloquear a busca global
          console.warn('Falha ao carregar equipamentos para busca global:', equipErr)
        }
      }

      // Senhas: placeholder vazio por enquanto
      const passwordItems: GlobalSearchItem[] = []

      setItems([...ticketItems, ...equipmentItems, ...passwordItems])
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao carregar dados para busca')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBaseData().catch((e) => console.error('Erro ao inicializar busca global:', e))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId])

  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys: ['title', 'subtitle', 'raw.description', 'raw.name', 'raw.label'],
      threshold: 0.35,
      ignoreLocation: true,
      includeScore: true,
    })
  }, [items])

  const results = useMemo<GlobalSearchItem[]>(() => {
    if (!query) return items
    const matches = fuse.search(query)
    return matches.map((m) => m.item)
  }, [query, items, fuse])

  return {
    query,
    setQuery,
    loading,
    error,
    results,
    refresh: loadBaseData,
  }
}

export default useGlobalSearch