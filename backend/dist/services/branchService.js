"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchService = void 0;
const branchRepository_1 = require("../repositories/branchRepository");
class BranchService {
    constructor() { this.repo = new branchRepository_1.BranchRepository(); }
    create(providerId, data) { return this.repo.create(providerId, data); }
    list(providerId) { return this.repo.list(providerId); }
    getById(id) { return this.repo.getById(id); }
    update(id, data) { return this.repo.update(id, data); }
    delete(id) { return this.repo.delete(id); }
}
exports.BranchService = BranchService;
