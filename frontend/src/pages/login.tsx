import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLocation, useNavigate, type Location, Link } from 'react-router-dom'
import styled from 'styled-components'
import { AuthTemplate } from '../components/templates/AuthTemplate'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Text } from '../components/ui/Text'

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

const ErrorMessage = styled(Text)`
  color: ${({ theme }) => theme.colors.error.main};
  text-align: center;
`

const FooterText = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  
  a {
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    
    &:hover {
      text-decoration: underline;
    }
  }
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
      await login({ email, password })
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch {
      setError('Falha no login. Verifique suas credenciais.')
    }
  }

  return (
    <AuthTemplate
      title="Bem-vindo de volta"
      subtitle="Entre na sua conta para continuar"
      backgroundImage='/images/logo.svg'
    >
      <LoginForm onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />

        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />

        {error && (
          <ErrorMessage variant="body2">
            {error}
          </ErrorMessage>
        )}

        <Button
          type="submit"
          variant="primary"

          fullWidth
        >
          Entrar
        </Button>

        <FooterText>
          <Text variant="body2" color="secondary">
            Não tem conta ##? <Link to="/register">Criar contas</Link>
          </Text>
        </FooterText>
      </LoginForm>
    </AuthTemplate>
  )
}

export default LoginPage;