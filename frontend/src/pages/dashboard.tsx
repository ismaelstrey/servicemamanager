import styled from 'styled-components'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

// Página de dashboard simples com logout (PT-BR)
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

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.accent};
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: filter ${({ theme }) => theme.transitions.fast}, transform ${({ theme }) => theme.transitions.fast};
  &:hover { filter: brightness(1.05); transform: translateY(-1px); }
`

export function DashboardPage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  return (
    <Wrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header>
        <Title>Dashboard</Title>
        <Actions>
          <Button onClick={() => navigate('/equipments')}>Ver Equipamentos</Button>
          <Button onClick={logout}>Sair</Button>
        </Actions>
      </Header>
      <p>Bem-vindo{user ? `, ${user.name}` : ''}! Em breve: métricas, inventário, tickets.</p>
    </Wrapper>
  )
}