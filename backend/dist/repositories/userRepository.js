"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = require("../lib/prisma");
// Repositório de usuários para acesso ao banco
class UserRepository {
    // Cria usuário
    async create(name, email, passwordHash) {
        const user = await prisma_1.prisma.user.create({ data: { name, email, password: passwordHash } });
        return { id: user.id, name: user.name, email: user.email, role: user.role };
    }
    // Busca por email
    async findByEmail(email) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        return user ? { id: user.id, name: user.name, email: user.email, password: user.password, role: user.role } : null;
    }
}
exports.UserRepository = UserRepository;
