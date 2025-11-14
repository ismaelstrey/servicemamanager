import { useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { ApiService } from '../services/api'
import { TicketService } from '../services/ticketService'
import type { CreateTicketData, Ticket } from '../types/ticket'

function resolveProviderId(userProviderId?: number | null): number | null {
  if (userProviderId && Number.isInteger(userProviderId) && userProviderId > 0) return userProviderId
  try {
    const raw = localStorage.getItem('selectedProviderId')
    const pid = raw && raw !== 'global' ? Number(raw) : NaN
    return Number.isInteger(pid) && pid > 0 ? pid : null
  } catch {
    return null
  }
}

export function useTickets() {
  const { user } = useAuth()
  const providerId = useMemo(() => resolveProviderId(user?.providerId ?? null), [user?.providerId])

  const createTicket = useMutation({
    mutationFn: async (data: CreateTicketData): Promise<Ticket> => {
      if (!providerId || providerId <= 0) throw new Error('ProviderId inválido')
      const ticket = await TicketService.createTicket(providerId, data as unknown as any)
      return ticket
    }
  })

  const listEquipments = async (): Promise<Array<{ id: number; name: string }>> => {
    if (!providerId || providerId <= 0) throw new Error('ProviderId inválido')
    const res = await ApiService.get<any>(`/providers/${providerId}/equipments`, { params: { limit: 100 } })
    const items = res?.data?.data ?? res?.data ?? []
    return (items as any[]).map((e) => ({ id: Number(e.id), name: e.name || e.label || `Equipamento #${e.id}` }))
  }

  return { providerId, createTicket, listEquipments }
}