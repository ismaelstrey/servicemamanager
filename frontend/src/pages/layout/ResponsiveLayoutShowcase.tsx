import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Container, Grid, GridItem, Flex, Spacer, HideAbove, HideBelow } from '../../components/layout';
import { Card, CardBody, Button, Badge, Heading } from '../../components/ui';

const SectionTitle: React.FC<{ title: string, subtitle?: string }> = ({ title, subtitle }) => (
  <SectionTitleWrap>
    <Heading level={2}>{title}</Heading>
    {subtitle && <Subtitle>{subtitle}</Subtitle>}
  </SectionTitleWrap>
);

const Box: React.FC<{ label: string }> = ({ label }) => (
  <Card>
    <CardBody>
      <BoxRow>
        <span>{label}</span>
        <Badge variant="primary">Demo</Badge>
      </BoxRow>
    </CardBody>
  </Card>
);

const ResponsiveLayoutShowcase: React.FC = () => {
  return (
    <MotionContainer initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Container maxWidth="xl">
      <SectionTitle title="Container" subtitle="Max-width por breakpoint e modo fluido" />

      <Flex gap="md" wrap="wrap" align="center">
        <Button onClick={() => {}}>Ação</Button>
        <Button variant="secondary">Secundária</Button>
      </Flex>

      <Spacer size="lg" />

      <Card>
        <CardBody>
          <p>Este container usa maxWidth="xl" e padding responsivo baseado nos tokens.</p>
        </CardBody>
      </Card>

      <Spacer size="xl" />

      <SectionTitle title="Grid" subtitle="Auto-fit com minmax e colunas responsivas" />
      <Grid minColWidth="260px" gap="md">
        <GridItem><Box label="Item 1" /></GridItem>
        <GridItem><Box label="Item 2" /></GridItem>
        <GridItem><Box label="Item 3" /></GridItem>
        <GridItem><Box label="Item 4" /></GridItem>
        <GridItem><Box label="Item 5" /></GridItem>
      </Grid>

      <Spacer size="xl" />

      <SectionTitle title="Flex" subtitle="Alinhamento, direção e gap responsivos" />
      <Flex direction="column" directionMd="row" gap="md" align="center" justifyMd="space-between">
        <Box label="Flex A" />
        <Box label="Flex B" />
        <Box label="Flex C" />
      </Flex>

      <Spacer size="xl" />

      <SectionTitle title="Visibility" subtitle="Mostrar/ocultar por breakpoint" />
      <VisibilityGrid>
        <HideAbove breakpoint="md">
          <Card><CardBody>Visível apenas em telas até md (mobile/tablet)</CardBody></Card>
        </HideAbove>
        <HideBelow breakpoint="md">
          <Card><CardBody>Visível apenas em telas a partir de md (desktop)</CardBody></Card>
        </HideBelow>
      </VisibilityGrid>

      <Spacer size="xl" />

      <SectionTitle title="Spacer" subtitle="Espaçamento vertical e horizontal" />
      <ButtonsRow>
        <Button>Botão 1</Button>
        <Spacer axis="x" size="md" />
        <Button variant="secondary">Botão 2</Button>
        <Spacer axis="x" size="lg" />
        <Button variant="outline">Botão 3</Button>
      </ButtonsRow>
      </Container>
    </MotionContainer>
  );
};

export default ResponsiveLayoutShowcase;

const SectionTitleWrap = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const MotionContainer = styled(motion.div)`
  width: 100%;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const BoxRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const VisibilityGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
`;