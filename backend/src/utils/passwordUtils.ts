import bcrypt from 'bcrypt';

// Funções utilitárias para hash e comparação de senha
export async function hashPassword(plain: string): Promise<string> {
  // Gera hash com sal
  const saltRounds: number = 10;
  return bcrypt.hash(plain, saltRounds);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  // Compara senha com hash
  return bcrypt.compare(plain, hash);
}