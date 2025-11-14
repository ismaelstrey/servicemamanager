"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = require("../lib/prisma");
class UserRepository {
    async create(name, email, passwordHash, role) {
        const user = await prisma_1.prisma.user.create({ data: { name, email, password: passwordHash, role: role || 'user' } });
        return { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive };
    }
    async findByEmail(email) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        return user ? { id: user.id, name: user.name, email: user.email, password: user.password, role: user.role, isActive: user.isActive } : null;
    }
    async getById(id) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!user)
            return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt };
    }
    async list(params) {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const where = {};
        if (params.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { email: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        if (typeof params.isActive === 'boolean')
            where.isActive = params.isActive;
        if (params.role)
            where.role = params.role;
        const orderBy = params.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { createdAt: 'desc' };
        const [items, total] = await Promise.all([
            prisma_1.prisma.user.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } }),
            prisma_1.prisma.user.count({ where })
        ]);
        return { items, total, page, limit };
    }
    async update(id, data) {
        const payload = {};
        if (data.name)
            payload.name = data.name;
        if (data.email)
            payload.email = data.email;
        if (data.role)
            payload.role = data.role;
        if (data.passwordHash)
            payload.password = data.passwordHash;
        const user = await prisma_1.prisma.user.update({ where: { id }, data: payload });
        return { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive };
    }
    async setActive(id, isActive) {
        const user = await prisma_1.prisma.user.update({ where: { id }, data: { isActive } });
        return { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive };
    }
}
exports.UserRepository = UserRepository;
