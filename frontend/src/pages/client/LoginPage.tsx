import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useClientAuth } from '../../hooks/useClientAuth';
import { Input, Button, Checkbox, Card, CardHeader, CardBody, Alert, Heading } from '../../components/ui';

const ClientLoginPage: React.FC = () => {
  const { login, isLoading, error } = useClientAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/client/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password, rememberMe });
      navigate(from, { replace: true });
    } catch (e) {
      // erro já tratado no contexto
    }
  };

  return (
    <PageWrap>
      <MotionContainer initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card variant="elevated">
          <CardHeader>
            <HeaderRow>
              <Heading level={2}>Portal do Cliente</Heading>
              <Subtitle>Acesse suas ordens de serviço e tickets.</Subtitle>
            </HeaderRow>
          </CardHeader>
          <CardBody>
            {error && (
              <Alert variant="error" title="Falha no login">{error}</Alert>
            )}
            <Form onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="cliente@exemplo.com"
                fullWidth
                size="md"
                variant="outlined"
              />
              <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                fullWidth
                size="md"
                variant="outlined"
              />
              <CheckboxRow>
                <Checkbox
                  label="Lembrar-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe((e.target as HTMLInputElement).checked)}
                  size="md"
                />
              </CheckboxRow>
              <MotionButton whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" disabled={isLoading} variant="primary" fullWidth>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </MotionButton>
            </Form>
          </CardBody>
        </Card>
      </MotionContainer>
    </PageWrap>
  );
};

export default ClientLoginPage;

const PageWrap = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background.primary};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const HeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const MotionContainer = styled(motion.div)`
  width: 100%;
  max-width: 440px;
`;

const MotionButton = styled(motion.div)`
  width: 100%;
`;