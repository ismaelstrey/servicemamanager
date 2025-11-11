import { prisma } from '../lib/prisma';

export class CustomerRepository {
  async findByEmail(email: string) {
    const customer = await prisma.customer.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        providerId: true,
        isActive: true
      }
    });
    return customer;
  }

  async findById(id: number) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        providerId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return customer;
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    providerId: number;
    role?: string;
    phone?: string;
    document?: string;
    address?: any;
  }) {
    const created = await prisma.customer.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        providerId: true,
        isActive: true
      }
    });
    return created;
  }

  async setResetToken(email: string, token: string, expiresAt: Date) {
    await prisma.customer.update({
      where: { email },
      data: { resetToken: token, resetTokenExpires: expiresAt }
    });
  }

  async findByResetToken(token: string) {
    const customer = await prisma.customer.findFirst({
      where: { resetToken: token },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        providerId: true,
        isActive: true,
        resetTokenExpires: true
      }
    });
    return customer;
  }

  async updatePasswordAndClearToken(customerId: number, passwordHash: string) {
    await prisma.customer.update({
      where: { id: customerId },
      data: { password: passwordHash, resetToken: null, resetTokenExpires: null }
    });
  }

  async updateProfile(customerId: number, data: { name?: string; phone?: string; document?: string; address?: any }) {
    const updated = await prisma.customer.update({
      where: { id: customerId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        document: true,
        address: true,
        providerId: true,
        isActive: true,
      },
    });
    return updated;
  }

  async list(params: { providerId?: number; search?: string; page?: number; limit?: number }) {
    const { providerId, search, page = 1, limit = 10 } = params;
    const where: any = {
      isActive: true,
    };
    // Se providerId for informado, filtra por ele; caso contrário, lista todos
    if (typeof providerId === 'number' && providerId > 0) {
      where.providerId = providerId;
    }
    if (search && search.trim().length > 0) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { document: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        select: { id: true, name: true, email: true, phone: true, document: true },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return { items, total, page, limit };
  }
}