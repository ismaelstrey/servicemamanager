import React from 'react'
import styled from 'styled-components'

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const Header = styled.header`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  padding: 1rem 2rem;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`

const Main = styled.main`
  flex: 1;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background.default};
`

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  margin: 0;
`

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'TelecomAI' }) => {
  return (
    <LayoutContainer>
      <Header>
        <Title>{title}</Title>
      </Header>
      <Main>
        {children}
      </Main>
    </LayoutContainer>
  )
}

export default Layout