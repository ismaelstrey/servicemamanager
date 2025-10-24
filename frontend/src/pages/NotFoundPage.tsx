import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
`

const Title = styled.h1`
  font-size: 4rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`

const Subtitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 2rem;
`

const BackLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary.main};
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`

const NotFoundPage: React.FC = () => {
  return (
    <Container>
      <Title>404</Title>
      <Subtitle>Página não encontrada</Subtitle>
      <BackLink to="/">Voltar ao início</BackLink>
    </Container>
  )
}

export default NotFoundPage