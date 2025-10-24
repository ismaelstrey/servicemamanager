import React from 'react';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  onClick: () => void;
  disabled?: boolean;
}

// Predefined common actions
export const createQuickActions = (handlers: {
  onCreateTicket: () => void;
  onCreateServiceOrder: () => void;
  onViewReports: () => void;
  onManageUsers: () => void;
  onViewSettings: () => void;
  onViewHelp: () => void;
}): QuickAction[] => [
  {
    id: 'create-ticket',
    title: 'Novo Ticket',
    description: 'Criar um novo ticket de suporte',
    icon: '🎫',
    color: 'primary',
    onClick: handlers.onCreateTicket,
  },
  {
    id: 'create-service-order',
    title: 'Nova Ordem de Serviço',
    description: 'Criar uma nova ordem de serviço',
    icon: '📋',
    color: 'success',
    onClick: handlers.onCreateServiceOrder,
  },
  {
    id: 'view-reports',
    title: 'Relatórios',
    description: 'Visualizar relatórios e estatísticas',
    icon: '📊',
    color: 'info',
    onClick: handlers.onViewReports,
  },
  {
    id: 'manage-users',
    title: 'Gerenciar Usuários',
    description: 'Administrar usuários do sistema',
    icon: '👥',
    color: 'warning',
    onClick: handlers.onManageUsers,
  },
  {
    id: 'view-settings',
    title: 'Configurações',
    description: 'Acessar configurações do sistema',
    icon: '⚙️',
    color: 'secondary',
    onClick: handlers.onViewSettings,
  },
  {
    id: 'view-help',
    title: 'Ajuda',
    description: 'Acessar documentação e suporte',
    icon: '❓',
    color: 'info',
    onClick: handlers.onViewHelp,
  },
];