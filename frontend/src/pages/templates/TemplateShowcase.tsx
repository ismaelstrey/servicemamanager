import React from 'react';
import styled from 'styled-components';
import { 
  DashboardTemplate,
  ListTemplate,
  DetailTemplate,
  FormTemplate,
  ErrorTemplate,
  EmptyStateTemplate,
} from '../../components/templates';
import { Card, CardBody, Button, Input, Select, Badge } from '../../components/ui';

const ShowcaseWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['2xl']};
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize['xl']};
`;

const TemplateShowcase: React.FC = () => {
  const toolbar = (
    <>
      <Input placeholder="Buscar..." />
      <Select>
        <option value="all">Todos</option>
        <option value="open">Abertos</option>
        <option value="closed">Fechados</option>
      </Select>
      <Button>Filtrar</Button>
    </>
  );

  const actions = (
    <>
      <Button variant="primary">Criar novo</Button>
      <Button variant="secondary">Exportar</Button>
    </>
  );

  const sidebarContent = (
    <Card>
      <CardBody>
        <Badge>Resumo</Badge>
        <p style={{ margin: 0 }}>Itens importantes e métricas.</p>
      </CardBody>
    </Card>
  );

  return (
    <ShowcaseWrapper>
      <section>
        <SectionTitle>DashboardTemplate</SectionTitle>
        <DashboardTemplate heading="Visão Geral" actions={actions} sidebar={sidebarContent}>
          <Card>
            <CardBody>Área principal do dashboard</CardBody>
          </Card>
          <Card>
            <CardBody>Gráficos e estatísticas</CardBody>
          </Card>
        </DashboardTemplate>
      </section>

      <section>
        <SectionTitle>ListTemplate</SectionTitle>
        <ListTemplate heading="Lista de Itens" actions={actions} toolbar={toolbar}>
          <Card>
            <CardBody>Tabela ou grid de dados</CardBody>
          </Card>
        </ListTemplate>
      </section>

      <section>
        <SectionTitle>DetailTemplate</SectionTitle>
        <DetailTemplate heading="Detalhes do Item" actions={actions} sidebar={sidebarContent}>
          <Card>
            <CardBody>Conteúdo detalhado</CardBody>
          </Card>
        </DetailTemplate>
      </section>

      <section>
        <SectionTitle>FormTemplate</SectionTitle>
        <FormTemplate heading="Criar Registro" actions={actions} sidebar={sidebarContent}>
          <Input placeholder="Campo 1" />
          <Input placeholder="Campo 2" />
          <Button variant="primary">Salvar</Button>
        </FormTemplate>
      </section>

      <section>
        <SectionTitle>ErrorTemplate</SectionTitle>
        <ErrorTemplate
          icon={<span>⚠️</span>}
          heading="Algo deu errado"
          description="Tente novamente ou volte para a página inicial."
          actions={<Button variant="primary">Voltar</Button>}
        />
      </section>

      <section>
        <SectionTitle>EmptyStateTemplate</SectionTitle>
        <EmptyStateTemplate
          icon={<span>📄</span>}
          heading="Nenhum item encontrado"
          description="Comece criando um novo ou ajuste os filtros."
          actions={<Button variant="primary">Criar novo</Button>}
        />
      </section>
    </ShowcaseWrapper>
  );
};

export default TemplateShowcase;