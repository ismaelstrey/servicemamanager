import { UserRepository } from '../repositories/userRepository';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { signToken } from '../utils/jwtUtils';
import { PrismaClient } from '@prisma/client';

export class AuthService {
  private userRepository: UserRepository;
  private prisma: PrismaClient;

  constructor() {
    this.userRepository = new UserRepository();
    this.prisma = new PrismaClient();
  }

  async register(name: string, email: string, password: string) {
    const passwordHash = await hashPassword(password);
    const created = await this.userRepository.create(name, email, passwordHash);

    const token = signToken({ userId: created.id, email: created.email, role: created.role });

    return {
      token,
      user: { id: created.id, name: created.name, email: created.email }
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new Error('Credenciais inválidas');
    }

    // Descobrir providerId: primeiro como proprietário, senão como membro
    let providerId: number | undefined;
    const owned = await this.prisma.provider.findFirst({
      where: { ownerId: user.id },
      select: { id: true }
    });
    if (owned) {
      providerId = owned.id;
    } else {
      const membership = await this.prisma.providerUser.findFirst({
        where: { userId: user.id },
        select: { providerId: true }
      });
      if (membership) providerId = membership.providerId;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role, providerId });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email }
    };
  }
}