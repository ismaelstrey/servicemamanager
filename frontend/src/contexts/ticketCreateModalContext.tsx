import React, { createContext, useContext, useMemo, useState } from 'react'
import { Modal, ModalBody, ModalFooter } from '../components/ui/Modal'
import { Button, Spinner, Select, Toast } from '../components/ui'
import { TicketForm } from '../components/composite'
import type { CreateTicketFormValues, PriorityOption, EquipmentOption } from '../components/composite'
import { useTickets } from '../hooks/useTickets'
import { useProviderContext } from './providerContext'
import useProviders from '../hooks/useProviders'

interface TicketCreateModalContextValue {
  open: (initial?: Partial<CreateTicketFormValues>) => void
  close: () => void
}

const TicketCreateModalContext = createContext<TicketCreateModalContextValue | undefined>(undefined)

export const TicketCreateModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState<CreateTicketFormValues>({ title: '', description: '', priority: 'medium', category: '', equipmentId: '' })
  const [errors, setErrors] = useState<Partial<CreateTicketFormValues>>({})
  const [equipment, setEquipment] = useState<EquipmentOption[]>([])
  const [loadingEquipment, setLoadingEquipment] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ id: number } | null>(null)
  const { createTicket, listEquipments } = useTickets()
  const { selectedProviderId } = useProviderContext()
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'error' | 'warning' | 'info'>('success')

  const priorities: PriorityOption[] = useMemo(() => ([
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' },
  ]), [])

  const categories = useMemo(() => ([
    'Hardware', 'Software', 'Network', 'Security', 'Maintenance', 'Support', 'Other'
  ]), [])

  const open = (initial?: Partial<CreateTicketFormValues>) => {
    setForm(prev => ({ ...prev, ...(initial || {}) }))
    setErrors({})
    setErrorMsg(null)
    setSuccess(null)
    setIsOpen(true)
    setLoadingEquipment(true)
    listEquipments().then(items => {
      setEquipment(items.map((i) => ({ id: String(i.id), name: i.name })))
    }).finally(() => setLoadingEquipment(false))
  }
  const close = () => {
    setIsOpen(false)
    setTimeout(() => {
      setForm({ title: '', description: '', priority: 'medium', category: '', equipmentId: '' })
      setErrors({})
      setErrorMsg(null)
      setSuccess(null)
    }, 100)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateTicketFormValues> = {}
    if (!form.title.trim()) newErrors.title = 'Título é obrigatório'
    else if (form.title.length < 5) newErrors.title = 'Título deve ter pelo menos 5 caracteres'
    if (!form.description.trim()) newErrors.description = 'Descrição é obrigatória'
    else if (form.description.length < 10) newErrors.description = 'Descrição deve ter pelo menos 10 caracteres'
    if (!form.category) newErrors.category = 'Categoria é obrigatória'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const data: any = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        category: form.category.toLowerCase(),
        source: 'portal',
        customerInfo: { name: '-', email: '-' },
        equipmentId: form.equipmentId ? Number(form.equipmentId) : undefined,
        tags: []
      }
      const ticket = await createTicket.mutateAsync(data)
      setSuccess({ id: ticket.id })
      try {
        window.dispatchEvent(new CustomEvent('ticket-created', { detail: { id: ticket.id, providerId: selectedProviderId ?? null } }))
      } catch { }
      setToastVariant('success')
      setToastMsg(`Ticket #${ticket.id} criado com sucesso`)
      setToastOpen(true)
      try { close() } catch {}
      window.setTimeout(() => { try { setToastOpen(false) } catch { } }, 1500)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erro ao criar ticket. Tente novamente.'
      setErrorMsg(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateTicketFormValues, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const value = useMemo(() => ({ open, close }), [])

  return (
    <TicketCreateModalContext.Provider value={value}>
      {children}
      <Modal isOpen={isOpen} onClose={close} title={'Novo Ticket'} size="md">
        <ModalBody>
          {!success && (
            <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <ProviderSelectInline />
            </div>
          )}
          {success ? null : (
            <TicketForm
              values={form}
              errors={errors}
              isLoading={isLoading || loadingEquipment}
              errorMessage={errorMsg}
              categories={categories}
              priorities={priorities}
              equipmentList={equipment}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              onDismissError={() => setErrorMsg(null)}
              onCancel={close}
              showActions={false}
            />
          )}
        </ModalBody>
        {!success && (
          <ModalFooter>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
              <Button variant="secondary" onClick={close}>Cancelar</Button>
              <Button variant="primary" onClick={(e) => handleSubmit(e as any)}>{isLoading ? (<Spinner size="sm" />) : 'Criar'}</Button>
            </div>
          </ModalFooter>
        )}
      </Modal>
      {toastOpen && !!toastMsg && (
        <Toast
          open={toastOpen}
          onClose={() => setToastOpen(false)}
          title={toastVariant === 'success' ? 'Sucesso' : 'Informação'}
          description={toastMsg}
          variant={toastVariant}
        />
      )}
    </TicketCreateModalContext.Provider>
  )
}

export function useTicketCreateModal(): TicketCreateModalContextValue {
  const ctx = useContext(TicketCreateModalContext)
  if (!ctx) throw new Error('useTicketCreateModal deve ser usado dentro de TicketCreateModalProvider')
  return ctx
}

const ProviderSelectInline: React.FC = () => {
  const { selectedProviderId, setSelectedProviderId } = useProviderContext()
  const { data: providers = [] } = useProviders(50)
  return (
    <div style={{ width: 220 }}>
      <Select
        size="sm"
        variant="outlined"
        value={selectedProviderId == null ? 'global' : String(selectedProviderId)}
        onChange={(e) => {
          const val = (e.target as HTMLSelectElement).value
          setSelectedProviderId(val === 'global' ? null : Number(val))
        }}
      >
        <option value="global">Visão Global</option>
        {providers.map((p) => (
          <option key={p.id} value={String(p.id)}>{p.name}</option>
        ))}
      </Select>
    </div>
  )
}

export const TicketCreateModalGlobalBridge: React.FC = () => {
  const ctx = useContext(TicketCreateModalContext)
  if (!ctx) return null
  const { open, close } = ctx
  React.useEffect(() => {
    (window as any).openTicketCreateModal = (initial?: Partial<CreateTicketFormValues>) => { open(initial) }
    (window as any).closeTicketCreateModal = () => close()
    const handler = (e: any) => open(e?.detail || undefined)
    window.addEventListener('open-ticket-modal', handler as any)
    return () => {
      window.removeEventListener('open-ticket-modal', handler as any)
      delete (window as any).openTicketCreateModal
      delete (window as any).closeTicketCreateModal
    }
  }, [open, close])
  return null
}
