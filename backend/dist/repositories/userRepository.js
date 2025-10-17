"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const client_1 = require("@prisma/client");
// Repositório de usuários para acesso ao banco
const prisma = new client_1.PrismaClient();
class UserRepository {
    // Cria usuário
    async create(name, email, passwordHash) {
        const user = await prisma.user.create({ data: { name, email, password: passwordHash } });
        return { id: user.id, name: user.name, email: user.email };
    }
    // Busca por email
    async findByEmail(email) {
        const user = await prisma.user.findUnique({ where: { email } });
        return user ? { id: user.id, name: user.name, email: user.email, password: user.password } : null;
    }
}
exports.UserRepository = UserRepository;
