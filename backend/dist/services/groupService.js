"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupService = void 0;
const groupRepository_1 = require("../repositories/groupRepository");
class GroupService {
    constructor() { this.repo = new groupRepository_1.GroupRepository(); }
    create(providerId, data) { return this.repo.create(providerId, data); }
    list(providerId) { return this.repo.list(providerId); }
    get(id) { return this.repo.get(id); }
    update(id, data) { return this.repo.update(id, data); }
    addMembers(id, providerUserIds) { return this.repo.addMembers(id, providerUserIds); }
    removeMember(id, providerUserId) { return this.repo.removeMember(id, providerUserId); }
}
exports.GroupService = GroupService;
