import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLocation, useNavigate, type Location, Link } from 'react-router-dom'
import styled from 'styled-components'
import { AuthTemplate } from '../components/templates/AuthTemplate'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Text } from '../components/ui/Text'

const RegisterForm = styled.form`
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
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword
      })
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch {
      setError('Falha no registro. Verifique os dados e tente novamente.')
    }
  }

  return (
    <AuthTemplate
      title="Criar sua conta"
      subtitle="Preencha os dados para começar"
    >
      <RegisterForm onSubmit={handleSubmit}>
        <Input
          label="Nome"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />

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

        <Input
          label="Confirmar Senha"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          Criar conta
        </Button>

        <FooterText>
          <Text variant="body2" color="secondary">
            Já tem conta? <Link to="/login">Entrar</Link>
          </Text>
        </FooterText>
      </RegisterForm>
    </AuthTemplate>
  )
}

export default RegisterPage;