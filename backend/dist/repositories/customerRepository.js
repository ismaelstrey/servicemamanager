"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRepository = void 0;
const prisma_1 = require("../lib/prisma");
class CustomerRepository {
    async findByEmail(email) {
        const customer = await prisma_1.prisma.customer.findUnique({
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
    async findById(id) {
        const customer = await prisma_1.prisma.customer.findUnique({
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
    async create(data) {
        const created = await prisma_1.prisma.customer.create({
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
    async setResetToken(email, token, expiresAt) {
        await prisma_1.prisma.customer.update({
            where: { email },
            data: { resetToken: token, resetTokenExpires: expiresAt }
        });
    }
    async findByResetToken(token) {
        const customer = await prisma_1.prisma.customer.findFirst({
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
    async updatePasswordAndClearToken(customerId, passwordHash) {
        await prisma_1.prisma.customer.update({
            where: { id: customerId },
            data: { password: passwordHash, resetToken: null, resetTokenExpires: null }
        });
    }
    async updateProfile(customerId, data) {
        const updated = await prisma_1.prisma.customer.update({
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
    async list(params) {
        const { providerId, search, page = 1, limit = 10 } = params;
        const where = {
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
            prisma_1.prisma.customer.findMany({
                where,
                select: { id: true, name: true, email: true, phone: true, document: true },
                orderBy: { name: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.prisma.customer.count({ where }),
        ]);
        return { items, total, page, limit };
    }
}
exports.CustomerRepository = CustomerRepository;
