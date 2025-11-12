import type React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  // Compatibilidade com API anterior
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  clickable?: boolean;
  title?: string;
  margin?: string | number;
  // Novas props para controle de margem por eixo
  // marginX aplica nas laterais (left/right) e marginY em top/bottom
  marginX?: string | number;
  marginY?: string | number;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

// Props internos usados pelo StyledCard
export interface StyledCardProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  hoverable?: boolean;
  onClick?: () => void;
  margin?: string | number;
  // Props internas para margem por eixo
  marginX?: string | number;
  marginY?: string | number;
}