import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLocation, useNavigate, type Location, Link } from 'react-router-dom'
import styled from 'styled-components'
import { motion } from 'framer-motion'

// Página de registro com styled-components e animação (PT-BR)
const Container = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
`

const Card = styled(motion.div)`
  width: 100%;
  max-width: 420px;
  background: linear-gradient(180deg, rgba(17,24,39,0.92) 0%, rgba(17,24,39,0.75) 100%);
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg};
  transition: transform ${({ theme }) => theme.transitions.fast}, box-shadow ${({ theme }) => theme.transitions.fast};
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`

const Title = styled.h1`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  font-size: 1.5rem;
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
`

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  transition: border-color ${({ theme }) => theme.transitions.fast}, box-shadow ${({ theme }) => theme.transitions.fast};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.ring};
  }
`

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: filter ${({ theme }) => theme.transitions.fast}, transform ${({ theme }) => theme.transitions.fast};
  &:hover { filter: brightness(1.05); transform: translateY(-1px); }
`

const Footer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: 0.9rem;
`

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: Location } }

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (name.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres.')
      return
    }
    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    try {
      await register(name.trim(), email.trim(), password)
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError('Falha no registro. Verifique os dados e tente novamente.')
    }
  }

  return (
    <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Card initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120 }}>
        <Title>Criar conta</Title>
        <form onSubmit={handleSubmit}>
          <Field>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <Field>
            <Label htmlFor="confirm">Confirmar Senha</Label>
            <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </Field>
          {error && <p style={{ color: 'tomato', marginBottom: '12px' }}>{error}</p>}
          <Button type="submit">Registrar</Button>
        </form>
        <Footer>
          Já tem conta? <Link to="/login">Entrar</Link>
        </Footer>
      </Card>
    </Container>
  )
}