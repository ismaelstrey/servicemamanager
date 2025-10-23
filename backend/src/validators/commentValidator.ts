import Joi from 'joi';

export const createCommentSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(5000)
    .required()
    .messages({
      'string.empty': 'Conteúdo do comentário é obrigatório',
      'string.min': 'Comentário deve ter pelo menos 1 caractere',
      'string.max': 'Comentário não pode exceder 5000 caracteres',
      'any.required': 'Conteúdo do comentário é obrigatório'
    }),
  
  resourceType: Joi.string()
    .valid('ticket', 'service_order')
    .required()
    .messages({
      'any.only': 'Tipo de recurso deve ser "ticket" ou "service_order"',
      'any.required': 'Tipo de recurso é obrigatório'
    }),
  
  resourceId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID do recurso deve ser um número',
      'number.integer': 'ID do recurso deve ser um número inteiro',
      'number.positive': 'ID do recurso deve ser positivo',
      'any.required': 'ID do recurso é obrigatório'
    }),
  
  isInternal: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Campo isInternal deve ser verdadeiro ou falso'
    })
});

export const updateCommentSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(5000)
    .messages({
      'string.empty': 'Conteúdo do comentário não pode estar vazio',
      'string.min': 'Comentário deve ter pelo menos 1 caractere',
      'string.max': 'Comentário não pode exceder 5000 caracteres'
    }),
  
  isInternal: Joi.boolean()
    .messages({
      'boolean.base': 'Campo isInternal deve ser verdadeiro ou falso'
    })
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

export const commentFiltersSchema = Joi.object({
  resourceType: Joi.string()
    .valid('ticket', 'service_order')
    .messages({
      'any.only': 'Tipo de recurso deve ser "ticket" ou "service_order"'
    }),
  
  resourceId: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'ID do recurso deve ser um número',
      'number.integer': 'ID do recurso deve ser um número inteiro',
      'number.positive': 'ID do recurso deve ser positivo'
    }),
  
  userId: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'ID do usuário deve ser um número',
      'number.integer': 'ID do usuário deve ser um número inteiro',
      'number.positive': 'ID do usuário deve ser positivo'
    }),
  
  providerId: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'ID do provedor deve ser um número',
      'number.integer': 'ID do provedor deve ser um número inteiro',
      'number.positive': 'ID do provedor deve ser positivo'
    }),
  
  isInternal: Joi.boolean()
    .messages({
      'boolean.base': 'Campo isInternal deve ser verdadeiro ou falso'
    }),
  
  startDate: Joi.date()
    .iso()
    .messages({
      'date.base': 'Data de início deve ser uma data válida',
      'date.format': 'Data de início deve estar no formato ISO'
    }),
  
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .messages({
      'date.base': 'Data de fim deve ser uma data válida',
      'date.format': 'Data de fim deve estar no formato ISO',
      'date.min': 'Data de fim deve ser posterior à data de início'
    }),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Página deve ser um número',
      'number.integer': 'Página deve ser um número inteiro',
      'number.min': 'Página deve ser maior que 0'
    }),
  
  limit: Joi.number()
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

export const commentIdSchema = Joi.object({
  id: Joi.number()
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