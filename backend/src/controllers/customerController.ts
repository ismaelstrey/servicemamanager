import { Response } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { CustomerRepository } from '../repositories/customerRepository';
import { listCustomersSchema } from '../validators/customerValidator';
import { createPaginationMeta } from '../utils/paginationHelper';

const repository = new CustomerRepository();

export const customerController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const { search, page, limit, providerId: providerIdParam } = listCustomersSchema.parse(req.query);
    const providerId = req.providerId ?? providerIdParam;
    if (!providerId) return res.status(400).json({ message: 'providerId ausente no contexto' });

    const result = await repository.list({ providerId, search, page, limit });

    // Adiciona metadados de paginação conforme padrão do projeto
    const pagination = createPaginationMeta(result.page, result.limit, result.total);

    return res.json({
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      pagination,
    });
  },
};