"use strict";
// Tipos de provedor de serviços de internet
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_FEATURES = void 0;
exports.PLAN_FEATURES = {
    free: {
        maxUsers: 2,
        maxEquipments: 50,
        maxTicketsPerMonth: 100,
        maxStorageGB: 1,
        hasZabbixIntegration: false,
        hasAdvancedReports: false,
        hasApiAccess: false,
        hasPrioritySupport: false,
        hasCustomBranding: false,
        hasBackupRestore: false,
        retentionDays: 30
    },
    basic: {
        maxUsers: 5,
        maxEquipments: 200,
        maxTicketsPerMonth: 500,
        maxStorageGB: 5,
        hasZabbixIntegration: true,
        hasAdvancedReports: false,
        hasApiAccess: true,
        hasPrioritySupport: false,
        hasCustomBranding: false,
        hasBackupRestore: true,
        retentionDays: 90
    },
    professional: {
        maxUsers: 15,
        maxEquipments: 1000,
        maxTicketsPerMonth: 2000,
        maxStorageGB: 20,
        hasZabbixIntegration: true,
        hasAdvancedReports: true,
        hasApiAccess: true,
        hasPrioritySupport: true,
        hasCustomBranding: true,
        hasBackupRestore: true,
        retentionDays: 180
    },
    enterprise: {
        maxUsers: -1, // Ilimitado
        maxEquipments: -1, // Ilimitado
        maxTicketsPerMonth: -1, // Ilimitado
        maxStorageGB: 100,
        hasZabbixIntegration: true,
        hasAdvancedReports: true,
        hasApiAccess: true,
        hasPrioritySupport: true,
        hasCustomBranding: true,
        hasBackupRestore: true,
        retentionDays: 365
    }
};
