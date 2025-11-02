import React from 'react';
import { Container, Grid, GridItem, Flex, Spacer, HideAbove, HideBelow } from '../../components/layout';
import { Card, CardBody, Button, Badge } from '../../components/ui';

const SectionTitle: React.FC<{ title: string, subtitle?: string }> = ({ title, subtitle }) => (
  <div style={{ marginBottom: '16px' }}>
    <h2 style={{ margin: 0 }}>{title}</h2>
    {subtitle && <p style={{ margin: 0, color: '#777' }}>{subtitle}</p>}
  </div>
);

const Box: React.FC<{ label: string }> = ({ label }) => (
  <Card>
    <CardBody>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{label}</span>
        <Badge variant="primary">Demo</Badge>
      </div>
    </CardBody>
  </Card>
);

const ResponsiveLayoutShowcase: React.FC = () => {
  return (
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
      <div style={{ display: 'grid', gap: '16px' }}>
        <HideAbove breakpoint="md">
          <Card><CardBody>Visível apenas em telas até md (mobile/tablet)</CardBody></Card>
        </HideAbove>
        <HideBelow breakpoint="md">
          <Card><CardBody>Visível apenas em telas a partir de md (desktop)</CardBody></Card>
        </HideBelow>
      </div>

      <Spacer size="xl" />

      <SectionTitle title="Spacer" subtitle="Espaçamento vertical e horizontal" />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button>Botão 1</Button>
        <Spacer axis="x" size="md" />
        <Button variant="secondary">Botão 2</Button>
        <Spacer axis="x" size="lg" />
        <Button variant="outline">Botão 3</Button>
      </div>
    </Container>
  );
};

export default ResponsiveLayoutShowcase;