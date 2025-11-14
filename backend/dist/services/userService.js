"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const userRepository_1 = require("../repositories/userRepository");
const passwordUtils_1 = require("../utils/passwordUtils");
class UserService {
    constructor() {
        this.repo = new userRepository_1.UserRepository();
    }
    async list(query) {
        return this.repo.list(query);
    }
    async getById(id) {
        return this.repo.getById(id);
    }
    async create(input) {
        const existing = await this.repo.findByEmail(input.email);
        if (existing)
            throw new Error('EMAIL_IN_USE');
        const passwordHash = await (0, passwordUtils_1.hashPassword)(input.password);
        return this.repo.create(input.name, input.email, passwordHash, input.role);
    }
    async update(id, input) {
        let passwordHash;
        if (input.password)
            passwordHash = await (0, passwordUtils_1.hashPassword)(input.password);
        return this.repo.update(id, { name: input.name, email: input.email, role: input.role, passwordHash });
    }
    async disable(id) {
        return this.repo.setActive(id, false);
    }
    async enable(id) {
        return this.repo.setActive(id, true);
    }
}
exports.UserService = UserService;
exports.default = UserService;
