import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

interface ProviderContextValue {
  selectedProviderId: number | null
  mode: 'global' | 'provider'
  setSelectedProviderId: (id: number | null) => void
}

const ProviderContext = createContext<ProviderContextValue | undefined>(undefined)

export const ProviderContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProviderId, setSelectedProviderIdState] = useState<number | null>(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('selectedProviderId') : null
    if (!raw || raw === 'global') return null
    const num = Number(raw)
    return Number.isFinite(num) ? num : null
  })

  const mode: 'global' | 'provider' = selectedProviderId == null ? 'global' : 'provider'

  const setSelectedProviderId = (id: number | null) => {
    setSelectedProviderIdState(id)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('selectedProviderId', id == null ? 'global' : String(id))
      window.dispatchEvent(new CustomEvent('provider-context-changed', { detail: { selectedProviderId: id } }))
    }
  }

  const value = useMemo<ProviderContextValue>(() => ({ selectedProviderId, mode, setSelectedProviderId }), [selectedProviderId, mode])

  useEffect(() => {
    // sincroniza em caso de mudança externa
    const handler = (e: StorageEvent) => {
      if (e.key === 'selectedProviderId') {
        const raw = e.newValue
        if (!raw || raw === 'global') setSelectedProviderIdState(null)
        else {
          const num = Number(raw)
          setSelectedProviderIdState(Number.isFinite(num) ? num : null)
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>
}

export function useProviderContext(): ProviderContextValue {
  const ctx = useContext(ProviderContext)
  if (!ctx) throw new Error('useProviderContext deve ser usado dentro de ProviderContextProvider')
  return ctx
}