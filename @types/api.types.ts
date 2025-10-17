// Tipos específicos para APIs e requisições HTTP

import { Request, Response, NextFunction } from 'express';
import { User } from './user.types';

// Extensão do Request do Express com dados do usuário autenticado
export interface AuthenticatedRequest extends Request {
  user?: User;
  providerId?: number;
}

// Tipos de método HTTP
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Tipos de cabeçalhos HTTP
export interface ApiHeaders {
  'Content-Type'?: string;
  'Authorization'?: string;
  'X-Provider-ID'?: string;
  'X-Request-ID'?: string;
  'X-User-Agent'?: string;
}

// Tipos de parâmetros de rota
export interface RouteParams {
  id?: string;
  providerId?: string;
  userId?: string;
  [key: string]: string | undefined;
}

// Tipos de query parameters
export interface QueryParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  [key: string]: string | undefined;
}

// Tipos de middleware
export type MiddlewareFunction = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// Tipos de validação de entrada
export interface ValidationSchema {
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
}

// Tipos de resposta de erro HTTP
export interface HttpErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: any;
    timestamp: string;
    path: string;
    method: string;
  };
}

// Tipos de resposta de sucesso HTTP
export interface HttpSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

// Tipos de configuração de rota
export interface RouteConfig {
  path: string;
  method: HttpMethod;
  handler: string;
  middleware?: string[];
  validation?: ValidationSchema;
  auth?: boolean;
  permissions?: string[];
}

// Tipos de rate limiting
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Tipos de upload de arquivo
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Uint8Array; // Usando Uint8Array em vez de Buffer para compatibilidade
}

export interface UploadConfig {
  maxSize: number;
  allowedMimeTypes: string[];
  destination: string;
}

// Tipos de webhook
export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
  signature?: string;
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
  active: boolean;
}

// Tipos de cache
export interface CacheConfig {
  ttl: number; // Time to live em segundos
  key: string;
  tags?: string[];
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl: number;
  createdAt: Date;
  expiresAt: Date;
}