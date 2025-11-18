import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiService } from '../services/api'
import type { Priority } from '../types/common'
import type { TicketStatus } from '../types/ticket'

export interface EditTicket {
  id: number
  number: string
  title: string
  description: string
  status: TicketStatus
  priority: Priority
  source: string
  providerId: number
  createdAt: string | Date
  updatedAt: string | Date
  customerInfo?: { name?: string; email?: string }
  customerId?: number | null
}

function normalizeTicket(raw: { id: number; title: string; description: string; status: string; priority: Priority; source: string; providerId: number; createdAt: string; updatedAt: string } & Partial<{ number: string }>): EditTicket {
  const normalizedStatus = (raw.status === 'waiting_client' ? 'pending' : raw.status) as TicketStatus
  return {
    id: raw.id,
    number: String(raw.number ?? raw.id),
    title: raw.title,
    description: raw.description,
    status: normalizedStatus,
    priority: raw.priority,
    source: raw.source,
    providerId: raw.providerId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    customerInfo: { name: '', email: '' },
  }
}

export function useTicket(id: string | number) {
  const ticketId = typeof id === 'string' ? id : String(id)
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const res = await ApiService.get<EnvelopeTicket>(`/tickets/${ticketId}`)
      const raw = res.data
      return normalizeTicket(raw)
    },
  })
}

type UpdatePayload = Partial<Pick<EditTicket, 'title' | 'description' | 'status' | 'priority'>>

export function useUpdateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { id: number | string; payload: UpdatePayload }) => {
      const res = await ApiService.patch<EnvelopeTicket>(`/tickets/${params.id}`, params.payload)
      const raw = res.data
      return normalizeTicket(raw)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['ticket', String(data.id)], data)
    },
  })
}
interface EnvelopeTicket {
  id: number
  title: string
  description: string
  status: string
  priority: Priority
  source: string
  providerId: number
  createdAt: string
  updatedAt: string
  number?: string
}
