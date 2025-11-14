import React from 'react'
import styled from 'styled-components'
import { Badge } from '../ui'

interface TicketsListHeaderProps {
  isGlobalView: boolean
  totalItems: number
}

const TitleSection = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing?.xs || '0.5rem'};
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing?.xs || '0.5rem'};
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography?.fontSize?.xl || '1.25rem'};
  margin: 0;
`

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors?.text?.secondary || '#6b7280'};
  margin: 0;
`

const TicketsListHeader: React.FC<TicketsListHeaderProps> = ({ isGlobalView, totalItems }) => {
  return (
    <TitleSection>
      <TitleRow>
        <Title>Tickets</Title>
        <Badge variant={isGlobalView ? 'info' : 'secondary'}>
          {isGlobalView ? 'Visão Global' : 'Visão por Provedor'}
        </Badge>
      </TitleRow>
      <Subtitle>
        {totalItems} ticket{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
      </Subtitle>
    </TitleSection>
  )
}

export default TicketsListHeader