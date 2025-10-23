"use strict";
// Repositório para acesso aos dados de Equipamentos
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentRepository = void 0;
const client_1 = require("@prisma/client");
class EquipmentRepository {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    /**
     * Criar equipamento
     */
    async create(providerId, data) {
        try {
            const equipment = await this.prisma.equipment.create({
                data: {
                    providerId,
                    label: data.label,
                    type: data.type,
                    serial: data.serial,
                    status: data.status
                }
            });
            return this.mapFromPrisma(equipment);
        }
        catch (error) {
            console.error('Erro no EquipmentRepository.create:', error);
            if (error.code === 'P2002') {
                throw new Error('Serial já está em uso');
            }
            throw new Error(`Erro ao criar equipamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    /**
     * Listar equipamentos por provider com paginação
     */
    async listByProvider(providerId, query) {
        try {
            const { page = 1, limit = 10, search, type, status } = query;
            const skip = (page - 1) * limit;
            const where = { providerId };
            if (search) {
                where.OR = [
                    { label: { contains: search, mode: 'insensitive' } },
                    { serial: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (type) {
                where.type = { equals: type };
            }
            if (status) {
                where.status = { equals: status };
            }
            const total = await this.prisma.equipment.count({ where });
            const items = await this.prisma.equipment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            });
            const equipments = items.map((e) => this.mapFromPrisma(e));
            const pagination = {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            };
            return { equipments, pagination };
        }
        catch (error) {
            console.error('Erro no EquipmentRepository.listByProvider:', error);
            throw new Error(`Erro ao listar equipamentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async findById(id) {
        try {
            const equipment = await this.prisma.equipment.findUnique({ where: { id } });
            return equipment ? this.mapFromPrisma(equipment) : null;
        }
        catch (error) {
            console.error('Erro no EquipmentRepository.findById:', error);
            throw new Error(`Erro ao buscar equipamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async update(id, data) {
        try {
            const equipment = await this.prisma.equipment.update({
                where: { id },
                data: {
                    label: data.label,
                    type: data.type,
                    serial: data.serial,
                    status: data.status,
                    updatedAt: new Date()
                }
            });
            return equipment ? this.mapFromPrisma(equipment) : null;
        }
        catch (error) {
            console.error('Erro no EquipmentRepository.update:', error);
            if (error.code === 'P2002') {
                throw new Error('Serial já está em uso');
            }
            if (error.code === 'P2025') {
                return null;
            }
            throw new Error(`Erro ao atualizar equipamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    async delete(id) {
        try {
            await this.prisma.equipment.delete({ where: { id } });
            return true;
        }
        catch (error) {
            console.error('Erro no EquipmentRepository.delete:', error);
            if (error.code === 'P2025') {
                return false;
            }
            throw new Error(`Erro ao remover equipamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    mapFromPrisma(e) {
        return {
            id: e.id,
            label: e.label,
            type: e.type,
            serial: e.serial,
            status: e.status,
            providerId: e.providerId,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt
        };
    }
    async getStatsByProvider(providerId) {
        try {
            const total = await this.prisma.equipment.count({ where: { providerId } });
            const groups = await this.prisma.equipment.groupBy({
                by: ['type'],
                where: { providerId },
                _count: { _all: true }
            });
            const byType = {};
            for (const g of groups) {
                byType[g.type] = g._count._all;
            }
            return { total, byType };
        }
        catch (error) {
            console.error('Erro no EquipmentRepository.getStatsByProvider:', error);
            throw new Error(`Erro ao obter estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
}
exports.EquipmentRepository = EquipmentRepository;
