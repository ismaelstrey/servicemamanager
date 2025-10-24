import { Request } from 'express';

export interface Customer {
  id: number;
  name: string;
  email: string;
  providerId: number;
}

export interface ClientAuthenticatedRequest extends Request {
  customer?: Customer;
  rateLimit?: {
    limit: number;
    current: number;
    remaining: number;
    resetTime: number;
  };
}