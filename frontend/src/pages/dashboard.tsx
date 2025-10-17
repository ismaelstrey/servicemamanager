import styled from 'styled-components'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

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

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  cursor: pointer;
  font-weight: 600;
`

export function DashboardPage() {
  const { logout, user } = useAuth()

  return (
    <Wrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header>
        <Title>Dashboard</Title>
        <Button onClick={logout}>Sair</Button>
      </Header>
      <p>Bem-vindo{user ? `, ${user.name}` : ''}! Em breve: métricas, inventário, tickets.</p>
    </Wrapper>
  )
}