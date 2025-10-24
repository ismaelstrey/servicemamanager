"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordVaultRepository = void 0;
const client_1 = require("@prisma/client");
class PasswordVaultRepository {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async create(providerId, data) {
        try {
            const rec = await this.prisma.passwordVault.create({
                data: {
                    providerId,
                    label: data.label,
                    username: data.username,
                    password: data.password,
                    expiresAt: data.expiresAt,
                    rotationIntervalDays: data.rotationIntervalDays
                }
            });
            return this.mapFromPrisma(rec);
        }
        catch (error) {
            console.error('Erro no PasswordVaultRepository.create:', error);
            throw new Error(`Erro ao criar senha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async listByProvider(providerId, query) {
        try {
            const { page = 1, limit = 10, search } = query;
            const skip = (page - 1) * limit;
            const where = { providerId };
            if (search) {
                where.OR = [
                    { label: { contains: search, mode: 'insensitive' } },
                    { username: { contains: search, mode: 'insensitive' } }
                ];
            }
            const total = await this.prisma.passwordVault.count({ where });
            const rows = await this.prisma.passwordVault.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            });
            const items = rows.map((r) => {
                const m = this.mapFromPrisma(r);
                const { password, ...rest } = m;
                return rest;
            });
            const totalPages = Math.ceil(total / limit);
            const pagination = {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };
            return { items, pagination };
        }
        catch (error) {
            console.error('Erro no PasswordVaultRepository.listByProvider:', error);
            throw new Error(`Erro ao listar senhas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async findById(id) {
        try {
            const rec = await this.prisma.passwordVault.findUnique({ where: { id } });
            return rec ? this.mapFromPrisma(rec) : null;
        }
        catch (error) {
            console.error('Erro no PasswordVaultRepository.findById:', error);
            throw new Error(`Erro ao buscar senha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async update(id, data) {
        try {
            const rec = await this.prisma.passwordVault.update({
                where: { id },
                data: {
                    label: data.label,
                    username: data.username,
                    password: data.password,
                    expiresAt: data.expiresAt,
                    rotationIntervalDays: data.rotationIntervalDays,
                    lastRotatedAt: data.lastRotatedAt,
                    updatedAt: new Date()
                }
            });
            return rec ? this.mapFromPrisma(rec) : null;
        }
        catch (error) {
            console.error('Erro no PasswordVaultRepository.update:', error);
            if (error.code === 'P2025') {
                return null;
            }
            throw new Error(`Erro ao atualizar senha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async delete(id) {
        try {
            await this.prisma.passwordVault.delete({ where: { id } });
            return true;
        }
        catch (error) {
            console.error('Erro no PasswordVaultRepository.delete:', error);
            if (error.code === 'P2025') {
                return false;
            }
            throw new Error(`Erro ao remover senha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async getStatsByProvider(providerId) {
        try {
            const total = await this.prisma.passwordVault.count({ where: { providerId } });
            return { total };
        }
        catch (error) {
            console.error('Erro no PasswordVaultRepository.getStatsByProvider:', error);
            throw new Error(`Erro ao obter estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    mapFromPrisma(p) {
        return {
            id: p.id,
            label: p.label,
            username: p.username,
            password: p.password,
            providerId: p.providerId,
            expiresAt: p.expiresAt ?? null,
            lastRotatedAt: p.lastRotatedAt ?? null,
            rotationIntervalDays: p.rotationIntervalDays ?? null,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        };
    }
}
exports.PasswordVaultRepository = PasswordVaultRepository;
