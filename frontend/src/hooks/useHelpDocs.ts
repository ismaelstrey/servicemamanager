// Hook para listar tópicos de documentação/help.
// Mantém estrutura simples e tipada, com comentários em pt-BR.

export interface HelpTopic {
  id: string;
  title: string;
  path: string; // caminho relativo em docs/help
}

export function useHelpDocs(): HelpTopic[] {
  // Lista estática de tópicos baseada na estrutura criada em docs/help
  return [
    { id: 'backendStatus', title: 'Status do Backend', path: 'docs/backendStatus.md' },
    { id: 'frontendStatus', title: 'Status do Frontend', path: 'docs/frontendStatus.md' },
    { id: 'overview', title: 'Visão Geral', path: 'docs/help/overview.md' },
    { id: 'auth', title: 'Autenticação', path: 'docs/help/auth.md' },
    { id: 'tickets', title: 'Tickets', path: 'docs/help/tickets.md' },
    { id: 'serviceOrders', title: 'Ordens de Serviço', path: 'docs/help/serviceOrders.md' },
    { id: 'reports', title: 'Relatórios', path: 'docs/help/reports.md' },
    { id: 'users', title: 'Usuários', path: 'docs/help/users.md' },
    { id: 'settings', title: 'Configurações', path: 'docs/help/settings.md' },
    { id: 'integrations', title: 'Integrações', path: 'docs/help/integrations.md' },
    { id: 'envs', title: 'Variáveis de Ambiente', path: 'docs/help/envs.md' },
    { id: 'deploy', title: 'Deploy', path: 'docs/help/deploy.md' },
    { id: 'pm2', title: 'PM2', path: 'docs/help/pm2.md' },
    { id: 'swagger', title: 'Swagger', path: 'docs/help/swagger.md' },
  ];
}
