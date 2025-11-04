import React, { useState } from 'react'
import styled from 'styled-components'
import { Button } from '../components/atoms/Button'
import { Input } from '../components/atoms/Input'
import { Card, CardHeader, CardBody, CardFooter, CardTitle, CardSubtitle, CardDescription } from '../components/atoms/Card'

const TestPageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  max-width: 1200px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.background.primary};
  min-height: 100vh;
`

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border.primary};
  padding-bottom: ${({ theme }) => theme.spacing[2]};
`

const ComponentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`

const ComponentDemo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`

const FlexRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  align-items: center;
  flex-wrap: wrap;
`

const TestPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLoadingTest = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <TestPageContainer>
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        marginBottom: '2rem',
        textAlign: 'center',
        color: 'var(--color-text-primary)'
      }}>
        🎨 Design System Test Page
      </h1>

      {/* Seção de Botões */}
      <Section>
        <SectionTitle>Buttons</SectionTitle>
        
        <ComponentDemo>
          <h3>Variantes</h3>
          <FlexRow>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </FlexRow>

          <h3>Tamanhos</h3>
          <FlexRow>
<Button size="sm">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </FlexRow>

          <h3>Estados</h3>
          <FlexRow>
            <Button>Normal</Button>
            <Button loading={loading} onClick={handleLoadingTest}>
              {loading ? 'Loading...' : 'Test Loading'}
            </Button>
            <Button disabled>Disabled</Button>
          </FlexRow>

          <h3>Com Ícones</h3>
          <FlexRow>
            <Button leftIcon="←">Back</Button>
            <Button rightIcon="→">Next</Button>
            <Button leftIcon="+" rightIcon="→">Add & Continue</Button>
          </FlexRow>

          <h3>Full Width</h3>
          <Button fullWidth variant="primary">Full Width Button</Button>
        </ComponentDemo>
      </Section>

      {/* Seção de Inputs */}
      <Section>
        <SectionTitle>Inputs</SectionTitle>
        
        <ComponentGrid>
          <ComponentDemo>
            <h3>Variantes</h3>
            <Input 
              variant="default" 
              placeholder="Default input" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input variant="filled" placeholder="Filled input" />
            <Input variant="flushed" placeholder="Flushed input" />
          </ComponentDemo>

          <ComponentDemo>
            <h3>Tamanhos</h3>
            <Input size="sm" placeholder="Small input" />
            <Input size="md" placeholder="Medium input" />
            <Input size="lg" placeholder="Large input" />
          </ComponentDemo>

          <ComponentDemo>
            <h3>Com Labels e Helper Text</h3>
            <Input 
              label="Nome completo" 
              placeholder="Digite seu nome"
              helperText="Como você gostaria de ser chamado"
            />
            <Input 
              label="Email" 
              type="email"
              placeholder="seu@email.com"
              helperText="Usaremos para entrar em contato"
            />
            <Input 
              label="Senha inválida" 
              type="password"
              error
              placeholder="Sua senha"
              helperText="A senha deve ter pelo menos 8 caracteres"
            />
          </ComponentDemo>

          <ComponentDemo>
            <h3>Com Ícones</h3>
            <Input leftIcon="🔍" placeholder="Buscar..." />
            <Input rightIcon="👁️" placeholder="Senha" type="password" />
            <Input leftIcon="📧" rightIcon="✓" placeholder="Email validado" />
          </ComponentDemo>
        </ComponentGrid>
      </Section>

      {/* Seção de Cards */}
      <Section>
        <SectionTitle>Cards</SectionTitle>
        
        <ComponentGrid>
          <Card variant="default">
            <CardBody>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>
                Este é um card com a variante padrão.
              </CardDescription>
            </CardBody>
          </Card>

          <Card variant="outlined">
            <CardBody>
              <CardTitle>Outlined Card</CardTitle>
              <CardDescription>
                Este é um card com borda definida.
              </CardDescription>
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardBody>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>
                Este é um card com sombra elevada.
              </CardDescription>
            </CardBody>
          </Card>

          <Card variant="filled">
            <CardBody>
              <CardTitle>Filled Card</CardTitle>
              <CardDescription>
                Este é um card com fundo preenchido.
              </CardDescription>
            </CardBody>
          </Card>
        </ComponentGrid>

        <h3>Card Completo com Sub-componentes</h3>
        <ComponentGrid>
          <Card variant="outlined" interactive>
            <CardHeader>
              <CardTitle>Produto Premium</CardTitle>
              <CardSubtitle>R$ 99,90/mês</CardSubtitle>
            </CardHeader>
            <CardBody>
              <CardDescription>
                Acesso completo a todas as funcionalidades premium, 
                suporte prioritário e recursos avançados.
              </CardDescription>
              <ul style={{ margin: '1rem 0', paddingLeft: '1.5rem' }}>
                <li>Recursos ilimitados</li>
                <li>Suporte 24/7</li>
                <li>API avançada</li>
              </ul>
            </CardBody>
            <CardFooter>
              <Button variant="primary" fullWidth>Assinar Agora</Button>
            </CardFooter>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Formulário de Contato</CardTitle>
              <CardSubtitle>Entre em contato conosco</CardSubtitle>
            </CardHeader>
            <CardBody>
              <ComponentDemo>
                <Input 
                  label="Nome" 
                  placeholder="Seu nome completo"
                  leftIcon="👤"
                />
                <Input 
                  label="Email" 
                  type="email"
                  placeholder="seu@email.com"
                  leftIcon="📧"
                />
                <Input 
                  label="Mensagem" 
                  placeholder="Sua mensagem..."
                  helperText="Descreva como podemos ajudar"
                />
              </ComponentDemo>
            </CardBody>
            <CardFooter>
              <FlexRow>
                <Button variant="primary">Enviar</Button>
                <Button variant="ghost">Cancelar</Button>
              </FlexRow>
            </CardFooter>
          </Card>
        </ComponentGrid>
      </Section>

      {/* Seção de Combinações */}
      <Section>
        <SectionTitle>Combinações e Layouts</SectionTitle>
        
        <Card variant="outlined" size="lg">
          <CardHeader>
            <CardTitle>Dashboard de Exemplo</CardTitle>
            <CardSubtitle>Demonstração de componentes combinados</CardSubtitle>
          </CardHeader>
          <CardBody>
            <ComponentGrid>
              <ComponentDemo>
                <h4>Ações Rápidas</h4>
                <FlexRow>
                  <Button variant="primary" size="sm" leftIcon="+">Novo</Button>
                  <Button variant="outline" size="sm" leftIcon="📊">Relatório</Button>
                  <Button variant="ghost" size="sm" leftIcon="⚙️">Config</Button>
                </FlexRow>
              </ComponentDemo>

              <ComponentDemo>
                <h4>Busca e Filtros</h4>
                <Input 
                  leftIcon="🔍" 
                  placeholder="Buscar itens..."
                  rightIcon="🔽"
                />
              </ComponentDemo>
            </ComponentGrid>

            <div style={{ marginTop: '1.5rem' }}>
              <h4>Estatísticas</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <Card variant="filled" size="sm">
                  <CardBody>
                    <CardTitle>1,234</CardTitle>
                    <CardDescription>Total de usuários</CardDescription>
                  </CardBody>
                </Card>
                <Card variant="filled" size="sm">
                  <CardBody>
                    <CardTitle>567</CardTitle>
                    <CardDescription>Vendas este mês</CardDescription>
                  </CardBody>
                </Card>
                <Card variant="filled" size="sm">
                  <CardBody>
                    <CardTitle>89%</CardTitle>
                    <CardDescription>Taxa de conversão</CardDescription>
                  </CardBody>
                </Card>
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <FlexRow>
              <Button variant="primary">Ver Relatório Completo</Button>
              <Button variant="outline">Exportar Dados</Button>
            </FlexRow>
          </CardFooter>
        </Card>
      </Section>
    </TestPageContainer>
  )
}

export default TestPage