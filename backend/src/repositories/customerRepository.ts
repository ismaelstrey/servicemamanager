import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CustomerRepository {
  async findByEmail(email: string) {
    const customer = await prisma.customer.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
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
        phone: true,
        document: true,
        address: true,
        providerId: true,
        isActive: true,
      },
    });
    return updated;
  }
}