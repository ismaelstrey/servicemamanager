import React, { useMemo, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Dropdown } from '../ui/Dropdown'
import { getTokenData } from '../../utils/authHelpers'

const TriggerButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
`

const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
`

const DetailsBox = styled.div`
  padding: 0.5rem 0.75rem;
  max-width: 280px;
  color: ${({ theme }) => theme.colors.text.primary};
`

const Label = styled.div`
  font-weight: 600;
  margin-bottom: 0.35rem;
`

const Line = styled.div`
  font-size: 0.9rem;
  margin: 0.15rem 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`

function formatRemaining(seconds: number): string {
  if (seconds <= 0) return 'expirada'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins >= 60) {
    const hours = Math.floor(mins / 60)
    const remMins = mins % 60
    return `${hours}h ${remMins}m`
  }
  return `${mins}m ${secs}s`
}

export const ProfileMenu: React.FC = () => {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

  const sessionExpMs = useMemo(() => {
    if (!token) return null
    const payload = getTokenData(token)
    if (!payload || !payload.exp) return null
    return Number(payload.exp) * 1000
  }, [token])

  const [remainingSec, setRemainingSec] = useState<number>(() => {
    if (!sessionExpMs) return 0
    const now = Date.now()
    return Math.max(0, Math.floor((sessionExpMs - now) / 1000))
  })

  useEffect(() => {
    if (!sessionExpMs) return
    const interval = setInterval(() => {
      const now = Date.now()
      const sec = Math.max(0, Math.floor((sessionExpMs - now) / 1000))
      setRemainingSec(sec)
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionExpMs])

  const initials = useMemo(() => {
    const name = user?.name || user?.email || 'U'
    const parts = name.split(' ')
    const first = parts[0]?.[0] ?? 'U'
    const second = parts[1]?.[0] ?? ''
    return (first + second).toUpperCase()
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const trigger = (
    <TriggerButton type="button" title="Perfil">
      <Avatar aria-hidden>{initials}</Avatar>
      <span>{user?.name ?? user?.email ?? 'Usuário'}</span>
    </TriggerButton>
  )

  return (
    <Dropdown trigger={trigger} placement="bottom-end">
      <DetailsBox>
        <Label>Detalhes e Status</Label>
        <Line>Nome: {user?.name ?? '—'}</Line>
        <Line>Email: {user?.email ?? '—'}</Line>
        <Line>Função: {user?.role ?? '—'}</Line>
        <Line>Status: {user ? 'Autenticado' : 'Não autenticado'}</Line>
        <Line>
          Tempo restante de sessão: {sessionExpMs ? formatRemaining(remainingSec) : 'indisponível'}
        </Line>
      </DetailsBox>
      <Dropdown.Divider />
      <Dropdown.Item onClick={() => navigate('/profile')}>Ver perfil</Dropdown.Item>
      <Dropdown.Item variant="danger" onClick={handleLogout}>Sair</Dropdown.Item>
    </Dropdown>
  )
}

export default ProfileMenu