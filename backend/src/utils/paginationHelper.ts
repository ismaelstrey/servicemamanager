// Utilitário para paginação otimizada

import { PaginationMeta } from '../types/common.types';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
  defaultLimit?: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export interface CursorPaginationOptions {
  cursor?: string | number;
  limit?: number;
  maxLimit?: number;
  defaultLimit?: number;
}

export interface CursorPaginationResult {
  cursor?: string | number;
  take: number;
  limit: number;
}

/**
 * Calcula parâmetros de paginação offset-based otimizada
 */
export function calculatePagination(options: PaginationOptions): PaginationResult {
  const {
    page = 1,
    limit = 10,
    maxLimit = 100,
    defaultLimit = 10
  } = options;

  // Validar e limitar parâmetros
  const validPage = Math.max(1, Math.floor(page));
  const validLimit = Math.min(
    Math.max(1, Math.floor(limit || defaultLimit)),
    maxLimit
  );

  const skip = (validPage - 1) * validLimit;

  return {
    skip,
    take: validLimit,
    page: validPage,
    limit: validLimit
  };
}

/**
 * Calcula parâmetros de paginação cursor-based (mais eficiente para grandes datasets)
 */
export function calculateCursorPagination(options: CursorPaginationOptions): CursorPaginationResult {
  const {
    cursor,
    limit = 10,
    maxLimit = 100,
    defaultLimit = 10
  } = options;

  const validLimit = Math.min(
    Math.max(1, Math.floor(limit || defaultLimit)),
    maxLimit
  );

  return {
    cursor,
    take: validLimit,
    limit: validLimit
  };
}

/**
 * Cria metadados de paginação
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

/**
 * Cria metadados de paginação cursor-based
 */
export function createCursorPaginationMeta(
  items: any[],
  limit: number,
  cursorField: string = 'id'
): {
  hasNext: boolean;
  nextCursor?: string | number;
  limit: number;
  count: number;
} {
  const hasNext = items.length === limit;
  const nextCursor = hasNext && items.length > 0 
    ? items[items.length - 1][cursorField]
    : undefined;

  return {
    hasNext,
    nextCursor,
    limit,
    count: items.length
  };
}

/**
 * Otimizações para queries grandes
 */
export function shouldUseCursorPagination(page: number, limit: number): boolean {
  // Para páginas muito altas ou limites grandes, cursor pagination é mais eficiente
  return (page * limit) > 10000;
}

/**
 * Calcula estimativa de performance para paginação
 */
export function estimatePaginationPerformance(
  page: number,
  limit: number,
  totalRecords: number
): {
  type: 'offset' | 'cursor';
  estimatedMs: number;
  recommendation: string;
} {
  const offset = (page - 1) * limit;
  
  if (offset > 10000 || totalRecords > 100000) {
    return {
      type: 'cursor',
      estimatedMs: Math.log(totalRecords) * 2, // Logarítmica para cursor
      recommendation: 'Use cursor-based pagination for better performance'
    };
  }
  
  return {
    type: 'offset',
    estimatedMs: Math.sqrt(offset) + 5, // Raiz quadrada para offset
    recommendation: 'Offset pagination is suitable for this range'
  };
}