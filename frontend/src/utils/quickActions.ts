import React from 'react';
import { Ticket, ClipboardList, BarChart3, Users, Settings, HelpCircle } from 'lucide-react';

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
    icon: React.createElement(Ticket, { size: 20 }),
    color: 'primary',
    onClick: handlers.onCreateTicket,
  },
  {
    id: 'create-service-order',
    title: 'Nova Ordem de Serviço',
    description: 'Criar uma nova ordem de serviço',
    icon: React.createElement(ClipboardList, { size: 20 }),
    color: 'success',
    onClick: handlers.onCreateServiceOrder,
  },
  {
    id: 'view-reports',
    title: 'Relatórios',
    description: 'Visualizar relatórios e estatísticas',
    icon: React.createElement(BarChart3, { size: 20 }),
    color: 'info',
    onClick: handlers.onViewReports,
  },
  {
    id: 'manage-users',
    title: 'Gerenciar Usuários',
    description: 'Administrar usuários do sistema',
    icon: React.createElement(Users, { size: 20 }),
    color: 'warning',
    onClick: handlers.onManageUsers,
  },
  {
    id: 'view-settings',
    title: 'Configurações',
    description: 'Acessar configurações do sistema',
    icon: React.createElement(Settings, { size: 20 }),
    color: 'secondary',
    onClick: handlers.onViewSettings,
  },
  {
    id: 'view-help',
    title: 'Ajuda',
    description: 'Acessar documentação e suporte',
    icon: React.createElement(HelpCircle, { size: 20 }),
    color: 'info',
    onClick: handlers.onViewHelp,
  },
];