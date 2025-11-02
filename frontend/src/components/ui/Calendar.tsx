import React from 'react';
import styled from 'styled-components';

export interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  date?: Date; // mês base
}

const Wrapper = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  font-weight: ${({ theme }) => theme.typography.ui.subtitle.fontWeight};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;

const Cell = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  text-align: center;
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-right: 1px solid ${({ theme }) => theme.colors.border.primary};
  &:nth-child(7n) { border-right: 0; }
`;

function getMonthMatrix(base: Date) {
  const year = base.getFullYear();
  const month = base.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const matrix: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) matrix.push(null);
  for (let d = 1; d <= daysInMonth; d++) matrix.push(d);
  while (matrix.length % 7 !== 0) matrix.push(null);
  return matrix;
}

export const Calendar: React.FC<CalendarProps> = ({ date = new Date(), ...props }) => {
  const monthName = date.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  const matrix = getMonthMatrix(date);
  const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  return (
    <Wrapper {...props}>
      <Header>{monthName}</Header>
      <Grid>
        {weekdays.map((w, i) => (
          <Cell key={`w-${i}`} style={{ fontWeight: 600 }}>{w}</Cell>
        ))}
        {matrix.map((d, i) => (
          <Cell key={i}>{d ?? ''}</Cell>
        ))}
      </Grid>
    </Wrapper>
  );
};

export default Calendar;