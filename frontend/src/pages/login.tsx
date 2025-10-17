import { FormEvent, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLocation, useNavigate, type Location } from 'react-router-dom'
import styled from 'styled-components'
import { motion } from 'framer-motion'

// Página de login com styled-components e animação (PT-BR)
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
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  padding: ${({ theme }) => theme.spacing.lg};
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
  border: 1px solid #1f2937;
  background: #0f172a;
  color: ${({ theme }) => theme.colors.text};
`

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
  font-weight: 600;
`

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: Location } }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais.')
    }
  }

  return (
    <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Card initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120 }}>
        <Title>Entrar</Title>
        <form onSubmit={handleSubmit}>
          <Field>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          {error && <p style={{ color: 'tomato', marginBottom: '12px' }}>{error}</p>}
          <Button type="submit">Entrar</Button>
        </form>
      </Card>
    </Container>
  )
}