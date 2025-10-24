"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentIdSchema = exports.commentFiltersSchema = exports.updateCommentSchema = exports.createCommentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createCommentSchema = joi_1.default.object({
    content: joi_1.default.string()
        .min(1)
        .max(5000)
        .required()
        .messages({
        'string.empty': 'Conteúdo do comentário é obrigatório',
        'string.min': 'Comentário deve ter pelo menos 1 caractere',
        'string.max': 'Comentário não pode exceder 5000 caracteres',
        'any.required': 'Conteúdo do comentário é obrigatório'
    }),
    resourceType: joi_1.default.string()
        .valid('ticket', 'service_order')
        .required()
        .messages({
        'any.only': 'Tipo de recurso deve ser "ticket" ou "service_order"',
        'any.required': 'Tipo de recurso é obrigatório'
    }),
    resourceId: joi_1.default.number()
        .integer()
        .positive()
        .required()
        .messages({
        'number.base': 'ID do recurso deve ser um número',
        'number.integer': 'ID do recurso deve ser um número inteiro',
        'number.positive': 'ID do recurso deve ser positivo',
        'any.required': 'ID do recurso é obrigatório'
    }),
    isInternal: joi_1.default.boolean()
        .default(false)
        .messages({
        'boolean.base': 'Campo isInternal deve ser verdadeiro ou falso'
    })
});
exports.updateCommentSchema = joi_1.default.object({
    content: joi_1.default.string()
        .min(1)
        .max(5000)
        .messages({
        'string.empty': 'Conteúdo do comentário não pode estar vazio',
        'string.min': 'Comentário deve ter pelo menos 1 caractere',
        'string.max': 'Comentário não pode exceder 5000 caracteres'
    }),
    isInternal: joi_1.default.boolean()
        .messages({
        'boolean.base': 'Campo isInternal deve ser verdadeiro ou falso'
    })
}).min(1).messages({
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});
exports.commentFiltersSchema = joi_1.default.object({
    resourceType: joi_1.default.string()
        .valid('ticket', 'service_order')
        .messages({
        'any.only': 'Tipo de recurso deve ser "ticket" ou "service_order"'
    }),
    resourceId: joi_1.default.number()
        .integer()
        .positive()
        .messages({
        'number.base': 'ID do recurso deve ser um número',
        'number.integer': 'ID do recurso deve ser um número inteiro',
        'number.positive': 'ID do recurso deve ser positivo'
    }),
    userId: joi_1.default.number()
        .integer()
        .positive()
        .messages({
        'number.base': 'ID do usuário deve ser um número',
        'number.integer': 'ID do usuário deve ser um número inteiro',
        'number.positive': 'ID do usuário deve ser positivo'
    }),
    providerId: joi_1.default.number()
        .integer()
        .positive()
        .messages({
        'number.base': 'ID do provedor deve ser um número',
        'number.integer': 'ID do provedor deve ser um número inteiro',
        'number.positive': 'ID do provedor deve ser positivo'
    }),
    isInternal: joi_1.default.boolean()
        .messages({
        'boolean.base': 'Campo isInternal deve ser verdadeiro ou falso'
    }),
    startDate: joi_1.default.date()
        .iso()
        .messages({
        'date.base': 'Data de início deve ser uma data válida',
        'date.format': 'Data de início deve estar no formato ISO'
    }),
    endDate: joi_1.default.date()
        .iso()
        .min(joi_1.default.ref('startDate'))
        .messages({
        'date.base': 'Data de fim deve ser uma data válida',
        'date.format': 'Data de fim deve estar no formato ISO',
        'date.min': 'Data de fim deve ser posterior à data de início'
    }),
    page: joi_1.default.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
        'number.base': 'Página deve ser um número',
        'number.integer': 'Página deve ser um número inteiro',
        'number.min': 'Página deve ser maior que 0'
    }),
    limit: joi_1.default.number()
        .integer()
        .min(1)
        .max(100)
        .default(20)
        .messages({
        'number.base': 'Limite deve ser um número',
        'number.integer': 'Limite deve ser um número inteiro',
        'number.min': 'Limite deve ser maior que 0',
        'number.max': 'Limite não pode exceder 100'
    })
});
exports.commentIdSchema = joi_1.default.object({
    id: joi_1.default.number()
        .integer()
        .positive()
        .required()
        .messages({
        'number.base': 'ID do comentário deve ser um número',
        'number.integer': 'ID do comentário deve ser um número inteiro',
        'number.positive': 'ID do comentário deve ser positivo',
        'any.required': 'ID do comentário é obrigatório'
    })
});
