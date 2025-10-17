"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const userRepository_1 = require("../repositories/userRepository");
const passwordUtils_1 = require("../utils/passwordUtils");
const jwtUtils_1 = require("../utils/jwtUtils");
// Serviço de autenticação responsável por login e registro
class AuthService {
    constructor() {
        this.userRepository = new userRepository_1.UserRepository();
    }
    // Registra um novo usuário
    async register(name, email, password) {
        const passwordHash = await (0, passwordUtils_1.hashPassword)(password);
        const created = await this.userRepository.create(name, email, passwordHash);
        const token = (0, jwtUtils_1.signToken)({ userId: created.id });
        // Retorna token e objeto de usuário, mantendo o password oculto
        return { token, user: { id: created.id, name: created.name, email: created.email } };
    }
    // Realiza login
    async login(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user)
            return null;
        const isValid = await (0, passwordUtils_1.comparePassword)(password, user.password);
        if (!isValid)
            return null;
        const token = (0, jwtUtils_1.signToken)({ userId: user.id });
        // Retorna token e objeto de usuário
        return { token, user: { id: user.id, name: user.name, email: user.email } };
    }
}
exports.AuthService = AuthService;
