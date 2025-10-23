import { PrismaClient } from '@prisma/client';

// Repositório de usuários para acesso ao banco
const prisma = new PrismaClient();

export class UserRepository {
  // Cria usuário
  async create(name: string, email: string, passwordHash: string): Promise<{ id: number; name: string; email: string; role: string }> {
    const user = await prisma.user.create({ data: { name, email, password: passwordHash } });
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  // Busca por email
  async findByEmail(email: string): Promise<{ id: number; name: string; email: string; password: string; role: string } | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? { id: user.id, name: user.name, email: user.email, password: user.password, role: user.role } : null;
  }
}