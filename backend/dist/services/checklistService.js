"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistService = void 0;
const checklistRepository_1 = require("../repositories/checklistRepository");
class ChecklistService {
    constructor() { this.repo = new checklistRepository_1.ChecklistRepository(); }
    createTemplate(data) {
        return this.repo.createTemplate(data);
    }
    getTemplate(id) { return this.repo.getTemplate(id); }
    updateTemplate(id, data) { return this.repo.updateTemplate(id, data); }
    deleteTemplate(id) { return this.repo.deleteTemplate(id); }
    linkTemplate(data) { return this.repo.linkTemplate(data); }
    getLink(linkId) { return this.repo.getLink(linkId); }
    updateItem(linkId, itemId, data) { return this.repo.updateItem(linkId, itemId, data); }
    deleteLink(linkId) { return this.repo.deleteLink(linkId); }
}
exports.ChecklistService = ChecklistService;
