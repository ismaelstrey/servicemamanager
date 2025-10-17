import { UserRepository } from '../repositories/userRepository';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { signToken } from '../utils/jwtUtils';

// Serviço de autenticação responsável por login e registro
export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // Registra um novo usuário
  async register(name: string, email: string, password: string): Promise<{ token: string; user: { id: number; name: string; email: string } }> {
    const passwordHash: string = await hashPassword(password);
    const created = await this.userRepository.create(name, email, passwordHash);
    const token: string = signToken({ userId: created.id });
    // Retorna token e objeto de usuário, mantendo o password oculto
    return { token, user: { id: created.id, name: created.name, email: created.email } };
  }

  // Realiza login
  async login(email: string, password: string): Promise<{ token: string; user: { id: number; name: string; email: string } } | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;
    const isValid: boolean = await comparePassword(password, user.password);
    if (!isValid) return null;
    const token: string = signToken({ userId: user.id });
    // Retorna token e objeto de usuário
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }
}