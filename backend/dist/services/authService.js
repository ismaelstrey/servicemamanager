"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const userRepository_1 = require("../repositories/userRepository");
const passwordUtils_1 = require("../utils/passwordUtils");
const jwtUtils_1 = require("../utils/jwtUtils");
const client_1 = require("@prisma/client");
class AuthService {
    constructor() {
        this.userRepository = new userRepository_1.UserRepository();
        this.prisma = new client_1.PrismaClient();
    }
    async register(name, email, password) {
        const passwordHash = await (0, passwordUtils_1.hashPassword)(password);
        const created = await this.userRepository.create(name, email, passwordHash);
        const token = (0, jwtUtils_1.signToken)({ userId: created.id, email: created.email, role: created.role });
        return {
            token,
            user: { id: created.id, name: created.name, email: created.email }
        };
    }
    async login(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        const valid = await (0, passwordUtils_1.comparePassword)(password, user.password);
        if (!valid) {
            throw new Error('Credenciais inválidas');
        }
        // Descobrir providerId: primeiro como proprietário, senão como membro
        let providerId;
        const owned = await this.prisma.provider.findFirst({
            where: { ownerId: user.id },
            select: { id: true }
        });
        if (owned) {
            providerId = owned.id;
        }
        else {
            const membership = await this.prisma.providerUser.findFirst({
                where: { userId: user.id },
                select: { providerId: true }
            });
            if (membership)
                providerId = membership.providerId;
        }
        const token = (0, jwtUtils_1.signToken)({ userId: user.id, email: user.email, role: user.role, providerId });
        return {
            token,
            user: { id: user.id, name: user.name, email: user.email }
        };
    }
}
exports.AuthService = AuthService;
