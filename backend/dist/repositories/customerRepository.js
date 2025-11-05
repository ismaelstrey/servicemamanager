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
exports.CustomerRepository = CustomerRepository;
