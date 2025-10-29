import { useEffect, useMemo, useState, useCallback } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { ApiService, type PaginatedResponse } from '../services/api'
import { decodeJwt } from '../utils/jwt'

const Wrapper = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.lg};
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const Title = styled.h2`
  margin: 0;
`

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: border-color ${({ theme }) => theme.animations.transition.fast}, box-shadow ${({ theme }) => theme.animations.transition.fast};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.ring};
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

const Card = styled.div<{ $type: EquipmentType }>`
  position: relative;
  background: linear-gradient(180deg, rgba(17,24,39,0.92) 0%, rgba(17,24,39,0.75) 100%);
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  transition: transform ${({ theme }) => theme.animations.transition.fast}, box-shadow ${({ theme }) => theme.animations.transition.fast};
  border-left: 3px solid ${({ theme, $type }) => {
    switch ($type) {
      case 'switch': return theme.colors.primary.main;
      case 'olt': return theme.colors.accent;
      case 'router': return theme.colors.warning.main;
      case 'server': return theme.colors.success.main;
      case 'virtualizer': return theme.colors.accentHover;
      default: return theme.colors.muted;
    }
  }};
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const Badge = styled.span<{ $status: 'active' | 'inactive' | 'maintenance' }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borders.radius.full};
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ theme, $status }) =>
    $status === 'active' ? theme.colors.success.main :
    $status === 'maintenance' ? theme.colors.warning.main :
    theme.colors.danger.main};
  color: #0b0f1a;
`

const MetaRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
`

const TypeTag = styled.span<{ $type: EquipmentType }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: ${({ theme }) => theme.borders.radius.full};
  border: 1px solid ${({ theme, $type }) => {
    switch ($type) {
      case 'switch': return theme.colors.primary.main;
      case 'olt': return theme.colors.accent;
      case 'router': return theme.colors.warning.main;
      case 'server': return theme.colors.success.main;
      case 'virtualizer': return theme.colors.accentHover;
      default: return theme.colors.muted;
    }
  }};
  color: ${({ theme }) => theme.colors.text.primary};
`

const StatBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
`

const types = [
  'switch',
  'olt',
  'router',
  'server',
  'virtualizer',
  'other'
] as const

type EquipmentType = typeof types[number]

type Equipment = {
  id: number
  label: string
  type: EquipmentType
  serial: string
  status: 'active' | 'inactive' | 'maintenance'
}

type Stats = {
  total: number
  online?: number
  offline?: number
  warning?: number
  critical?: number
  byType: Record<EquipmentType, number>
}

export function EquipmentsPage() {
  const { token } = useAuth()
  const [providerId, setProviderId] = useState<number | null>(null)
  const [items, setItems] = useState<Equipment[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [typeFilter, setTypeFilter] = useState<EquipmentType | ''>('')
  const limit = 50

  const hasToken = !!token
  const payload = useMemo(() => decodeJwt(token ?? undefined), [token])

  useEffect(() => {
    if (payload?.providerId) setProviderId(payload.providerId)
  }, [payload])

  const fetchData = useCallback(async (pid: number) => {
    const params: Record<string, unknown> = { limit }
    if (typeFilter) params.type = typeFilter

    const listRes = await ApiService.get<PaginatedResponse<Equipment>>(`/providers/${pid}/equipments`, { params })
    const statsRes = await ApiService.get<Stats>(`/providers/${pid}/equipments/stats`)

    setItems(listRes.data.data)
    setStats(statsRes.data)
  }, [limit, typeFilter])

  useEffect(() => {
    if (providerId && hasToken) {
      fetchData(providerId).catch((err) => console.error('Erro ao carregar equipamentos:', err))
    }
  }, [providerId, hasToken, fetchData])

  return (
    <Wrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header>
        <Title>Inventário de Equipamentos</Title>
        <Controls>
          <label>
            Tipo:
            <Select value={typeFilter} onChange={(e) => setTypeFilter((e.target.value || '') as EquipmentType | '')}>
              <option value="">Todos</option>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </label>
        </Controls>
      </Header>

      {stats && (
        <StatBar>
          <span>Total: {stats.total}</span>
          {types.map((t) => (
            <span key={t}>{t}: {stats.byType?.[t] ?? 0}</span>
          ))}
        </StatBar>
      )}

      <Grid>
    {items.map((e) => (
      <Card key={e.id} $type={e.type}>
        <CardHeader>
          <h3 style={{ margin: 0 }}>{e.label}</h3>
          <Badge $status={e.status}>
            {e.status === 'active' ? 'Ativo' : e.status === 'maintenance' ? 'Manutenção' : 'Inativo'}
          </Badge>
        </CardHeader>
        <MetaRow>
          <TypeTag $type={e.type}>{e.type}</TypeTag>
          <span>Serial: {e.serial}</span>
        </MetaRow>
      </Card>
    ))}
  </Grid>
    </Wrapper>
  )
}