"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAuthService = void 0;
const customerRepository_1 = require("../repositories/customerRepository");
const passwordUtils_1 = require("../utils/passwordUtils");
const jwtUtils_1 = require("../utils/jwtUtils");
const crypto_1 = __importDefault(require("crypto"));
class CustomerAuthService {
    constructor() {
        this.repo = new customerRepository_1.CustomerRepository();
    }
    async login(email, password) {
        const customer = await this.repo.findByEmail(email);
        if (!customer) {
            throw new Error('Cliente não encontrado');
        }
        if (!customer.isActive) {
            throw new Error('Cliente inativo');
        }
        const valid = await (0, passwordUtils_1.comparePassword)(password, customer.password);
        if (!valid) {
            throw new Error('Credenciais inválidas');
        }
        const token = (0, jwtUtils_1.signToken)({ customerId: customer.id, email: customer.email, providerId: customer.providerId, role: customer.role || 'customer_user' });
        return {
            token,
            customer: { id: customer.id, name: customer.name, email: customer.email, providerId: customer.providerId }
        };
    }
    async register(data) {
        const passwordHash = await (0, passwordUtils_1.hashPassword)(data.password);
        const created = await this.repo.create({
            name: data.name,
            email: data.email,
            password: passwordHash,
            providerId: data.providerId,
            role: data.role || 'customer_user',
            phone: data.phone,
            document: data.document
        });
        const token = (0, jwtUtils_1.signToken)({ customerId: created.id, email: created.email, providerId: created.providerId, role: created.role || 'customer_user' });
        return {
            token,
            customer: { id: created.id, name: created.name, email: created.email, providerId: created.providerId, role: created.role }
        };
    }
    async profile(customerId) {
        const customer = await this.repo.findById(customerId);
        if (!customer)
            throw new Error('Cliente não encontrado');
        return customer;
    }
    async forgotPassword(email) {
        const customer = await this.repo.findByEmail(email);
        // Responder sempre sucesso para evitar enumeração de usuários
        const successResponse = { success: true, message: 'Se existir, enviaremos instruções para recuperar a senha.' };
        if (!customer || !customer.isActive) {
            return successResponse;
        }
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        await this.repo.setResetToken(customer.email, token, expiresAt);
        if (process.env.NODE_ENV !== 'production') {
            successResponse.token = token;
        }
        return successResponse;
    }
    async resetPassword(token, newPassword) {
        const customer = await this.repo.findByResetToken(token);
        if (!customer || !customer.resetTokenExpires) {
            throw new Error('Token inválido ou expirado');
        }
        const isExpired = new Date(customer.resetTokenExpires).getTime() < Date.now();
        if (isExpired) {
            throw new Error('Token inválido ou expirado');
        }
        const passwordHash = await (0, passwordUtils_1.hashPassword)(newPassword);
        await this.repo.updatePasswordAndClearToken(customer.id, passwordHash);
        return { success: true, message: 'Senha atualizada com sucesso' };
    }
    async updateProfile(customerId, data) {
        const payload = {};
        if (data.name !== undefined)
            payload.name = data.name;
        if (data.phone !== undefined)
            payload.phone = data.phone;
        if (data.document !== undefined)
            payload.document = data.document;
        if (data.address !== undefined)
            payload.address = data.address;
        if (Object.keys(payload).length === 0) {
            throw new Error('Nenhum campo para atualizar');
        }
        const updated = await this.repo.updateProfile(customerId, payload);
        return updated;
    }
}
exports.CustomerAuthService = CustomerAuthService;
