import React from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle, Select } from '../ui'
import ProfileMenu from './ProfileMenu'
import { useProviderContext } from '../../contexts/providerContext'
import useProviders from '../../hooks/useProviders'

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const Header = styled.header`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  padding: 1rem 2rem;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`

const Main = styled.main`
  flex: 1;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background.primary};
`

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  margin: 0;
  cursor: pointer; /* apenas cursor pointer, sem hover */
`

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'TelecomAI' }) => {
  const navigate = useNavigate()
  const { selectedProviderId, setSelectedProviderId } = useProviderContext()
  const { data: providers = [] } = useProviders(50)
  return (
    <LayoutContainer>
      <Header>
        <HeaderContent>
          <Title
            role="link"
            tabIndex={0}
            onClick={() => navigate('/dashboard')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                navigate('/dashboard')
              }
            }}
          >
            {title}
          </Title>
          <RightActions>
            <Select
              label="Contexto"
              size="sm"
              value={selectedProviderId == null ? 'global' : String(selectedProviderId)}
              onChange={(e) => {
                const val = (e.target as HTMLSelectElement).value
                setSelectedProviderId(val === 'global' ? null : Number(val))
              }}
            >
              <option value="global">Visão Global</option>
              {providers.map((p) => (
                <option key={p.id} value={String(p.id)}>{p.name}</option>
              ))}
            </Select>
            <ThemeToggle />
            <ProfileMenu />
          </RightActions>
        </HeaderContent>
      </Header>
      <Main>
        {children}
      </Main>
    </LayoutContainer>
  )
}

export default Layout