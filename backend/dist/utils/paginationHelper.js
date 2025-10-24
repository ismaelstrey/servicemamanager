"use strict";
// Utilitário para paginação otimizada
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePagination = calculatePagination;
exports.calculateCursorPagination = calculateCursorPagination;
exports.createPaginationMeta = createPaginationMeta;
exports.createCursorPaginationMeta = createCursorPaginationMeta;
exports.shouldUseCursorPagination = shouldUseCursorPagination;
exports.estimatePaginationPerformance = estimatePaginationPerformance;
/**
 * Calcula parâmetros de paginação offset-based otimizada
 */
function calculatePagination(options) {
    const { page = 1, limit = 10, maxLimit = 100, defaultLimit = 10 } = options;
    // Validar e limitar parâmetros
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.min(Math.max(1, Math.floor(limit || defaultLimit)), maxLimit);
    const skip = (validPage - 1) * validLimit;
    return {
        skip,
        take: validLimit,
        page: validPage,
        limit: validLimit
    };
}
/**
 * Calcula parâmetros de paginação cursor-based (mais eficiente para grandes datasets)
 */
function calculateCursorPagination(options) {
    const { cursor, limit = 10, maxLimit = 100, defaultLimit = 10 } = options;
    const validLimit = Math.min(Math.max(1, Math.floor(limit || defaultLimit)), maxLimit);
    return {
        cursor,
        take: validLimit,
        limit: validLimit
    };
}
/**
 * Cria metadados de paginação
 */
function createPaginationMeta(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
}
/**
 * Cria metadados de paginação cursor-based
 */
function createCursorPaginationMeta(items, limit, cursorField = 'id') {
    const hasNext = items.length === limit;
    const nextCursor = hasNext && items.length > 0
        ? items[items.length - 1][cursorField]
        : undefined;
    return {
        hasNext,
        nextCursor,
        limit,
        count: items.length
    };
}
/**
 * Otimizações para queries grandes
 */
function shouldUseCursorPagination(page, limit) {
    // Para páginas muito altas ou limites grandes, cursor pagination é mais eficiente
    return (page * limit) > 10000;
}
/**
 * Calcula estimativa de performance para paginação
 */
function estimatePaginationPerformance(page, limit, totalRecords) {
    const offset = (page - 1) * limit;
    if (offset > 10000 || totalRecords > 100000) {
        return {
            type: 'cursor',
            estimatedMs: Math.log(totalRecords) * 2, // Logarítmica para cursor
            recommendation: 'Use cursor-based pagination for better performance'
        };
    }
    return {
        type: 'offset',
        estimatedMs: Math.sqrt(offset) + 5, // Raiz quadrada para offset
        recommendation: 'Offset pagination is suitable for this range'
    };
}
