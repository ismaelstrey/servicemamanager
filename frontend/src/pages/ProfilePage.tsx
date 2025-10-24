import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2rem;
`

const ProfilePage: React.FC = () => {
  return (
    <Container>
      <Title>Perfil do Usuário</Title>
      <p>Página de perfil em desenvolvimento...</p>
    </Container>
  )
}

export default ProfilePage