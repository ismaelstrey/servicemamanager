"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Minimal OpenAPI 3.0 spec for Equipments endpoints
const openapiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'ServiceManager API',
        version: '0.1.0',
        description: 'Documentação inicial dos endpoints principais (Equipments, Providers, Auth)'
    },
    servers: [
        { url: 'http://localhost:4002', description: 'Local (porta 4002)' },
        { url: 'http://localhost:4001', description: 'Local (porta 4001)' }
    ],
    paths: {
        // Auth routes
        '/auth/register': {
            post: {
                summary: 'Registrar novo usuário',
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 6 }
                                },
                                required: ['name', 'email', 'password']
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Usuário registrado com sucesso' },
                    '400': { description: 'Dados inválidos' },
                    '409': { description: 'Email já existe' }
                }
            }
        },
        '/auth/login': {
            post: {
                summary: 'Login do usuário',
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string' }
                                },
                                required: ['email', 'password']
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Login realizado com sucesso' },
                    '401': { description: 'Credenciais inválidas' }
                }
            }
        },
        // Provider routes
        '/api/providers': {
            get: {
                summary: 'Listar provedores',
                tags: ['Providers'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive'] } },
                    { name: 'plan', in: 'query', schema: { type: 'string', enum: ['basic', 'professional', 'enterprise'] } }
                ],
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProviderListResponse' } } } }
                }
            },
            post: {
                summary: 'Criar novo provedor',
                tags: ['Providers'],
                security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProviderCreate' } } } },
                responses: {
                    '201': { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProviderOneResponse' } } } }
                }
            }
        },
        '/api/providers/{id}': {
            get: {
                summary: 'Obter provedor por ID',
                tags: ['Providers'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProviderOneResponse' } } } },
                    '404': { description: 'Não encontrado' }
                }
            },
            put: {
                summary: 'Atualizar provedor',
                tags: ['Providers'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProviderUpdate' } } } },
                responses: {
                    '200': { description: 'Atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProviderOneResponse' } } } }
                }
            },
            delete: {
                summary: 'Remover provedor',
                tags: ['Providers'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { '204': { description: 'Removido' } }
            }
        },
        '/api/providers/{id}/stats': {
            get: {
                summary: 'Obter estatísticas do provedor',
                tags: ['Providers'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProviderStatsResponse' } } } }
                }
            }
        },
        '/api/providers/{id}/users': {
            get: {
                summary: 'Listar usuários do provedor',
                tags: ['Providers'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    '200': { description: 'OK' }
                }
            }
        },
        '/api/providers/check-workspace/{workspace}': {
            get: {
                summary: 'Verificar disponibilidade do workspace',
                tags: ['Providers'],
                parameters: [{ name: 'workspace', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/WorkspaceAvailabilityResponse' } } } }
                }
            }
        },
        // Password Vault routes
        '/api/providers/{providerId}/passwords': {
            get: {
                summary: 'Listar senhas do provedor',
                tags: ['Password Vault'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' } },
                    { name: 'page', in: 'query', schema: { type: 'integer' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PasswordVaultListResponse' } } } }
                }
            },
            post: {
                summary: 'Criar nova senha',
                tags: ['Password Vault'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'providerId', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PasswordVaultCreate' } } } },
                responses: {
                    '201': { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/PasswordVaultOneResponse' } } } }
                }
            }
        },
        '/api/providers/passwords/{id}': {
            get: {
                summary: 'Obter senha por ID',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PasswordVaultOneResponse' } } } }, '404': { description: 'Não encontrado' } }
            },
            put: {
                summary: 'Atualizar senha por ID',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PasswordVaultUpdate' } } } },
                responses: { '200': { description: 'Atualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/PasswordVaultRecord' }, message: { type: 'string' } } } } } } }
            },
            delete: {
                summary: 'Remover senha por ID',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { '200': { description: 'Removido' } }
            }
        },
        '/api/providers/passwords/{id}/rotate': {
            post: {
                summary: 'Rotacionar senha por ID',
                tags: ['Password Vault'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PasswordRotateRequest' } } } },
                responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PasswordVaultOneResponse' } } } }, '404': { description: 'Não encontrado' } }
            }
        },
        '/api/providers/{providerId}/equipments': {
            get: {
                summary: 'Listar equipamentos do provedor',
                tags: ['Equipments'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' } },
                    { name: 'page', in: 'query', schema: { type: 'integer' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'type', in: 'query', schema: { type: 'string', enum: ['switch', 'olt', 'router', 'server', 'virtualizer', 'other'] } },
                    { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive', 'maintenance'] } }
                ],
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/EquipmentListResponse' } } } }
                }
            },
            post: {
                summary: 'Criar novo equipamento',
                tags: ['Equipments'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'providerId', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EquipmentCreate' } } } },
                responses: {
                    '201': { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/EquipmentOneResponse' } } } }
                }
            }
        },
        '/api/providers/{providerId}/equipments/stats': {
            get: {
                summary: 'Obter estatísticas de equipamentos',
                tags: ['Equipments'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'providerId', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/EquipmentStatsResponse' } } } }
                }
            }
        },
        '/api/providers/equipments/{id}': {
            get: {
                summary: 'Obter equipamento por ID',
                tags: ['Equipments'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/EquipmentOneResponse' } } } },
                    '404': { description: 'Não encontrado' }
                }
            },
            put: {
                summary: 'Atualizar equipamento',
                tags: ['Equipments'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EquipmentUpdate' } } } },
                responses: {
                    '200': { description: 'Atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/EquipmentOneResponse' } } } }
                }
            },
            delete: {
                summary: 'Remover equipamento',
                tags: ['Equipments'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { '204': { description: 'Removido' } }
            }
        },
        // Ticket routes
        '/api/providers/{providerId}/tickets': {
            get: {
                summary: 'Listar tickets do provedor',
                tags: ['Tickets'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' } },
                    { name: 'page', in: 'query', schema: { type: 'integer' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'status', in: 'query', schema: { type: 'string', enum: ['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed', 'cancelled'] } },
                    { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] } },
                    { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
                    { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date-time' } }
                ],
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketListResponse' } } } }
                }
            },
            post: {
                summary: 'Criar novo ticket',
                tags: ['Tickets'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'providerId', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketCreate' } } } },
                responses: {
                    '201': { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketOneResponse' } } } }
                }
            }
        },
        // Novo: criar ticket automaticamente vinculado ao provedor do usuário
        '/api/tickets': {
            post: {
                summary: 'Criar novo ticket (vinculado ao provedor do usuário)',
                tags: ['Tickets'],
                security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketCreate' } } } },
                responses: {
                    '201': { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketOneResponse' } } } },
                    '400': { description: 'ProviderId não encontrado no usuário' },
                    '401': { description: 'Não autorizado' },
                    '403': { description: 'Acesso negado ao provedor' },
                    '404': { description: 'Recurso não encontrado' },
                    '422': { description: 'Erro de validação' },
                    '500': { description: 'Erro interno' }
                }
            }
        },
        '/api/providers/{providerId}/tickets/stats': {
            get: {
                summary: 'Obter estatísticas de tickets',
                tags: ['Tickets'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'providerId', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketStatsResponse' } } } }
                }
            }
        },
        '/api/providers/tickets/{id}': {
            get: {
                summary: 'Obter ticket por ID',
                tags: ['Tickets'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketOneResponse' } } } },
                    '404': { description: 'Não encontrado' }
                }
            },
            put: {
                summary: 'Atualizar ticket',
                tags: ['Tickets'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketUpdate' } } } },
                responses: {
                    '200': { description: 'Atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketOneResponse' } } } }
                }
            },
            delete: {
                summary: 'Remover ticket',
                tags: ['Tickets'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { '204': { description: 'Removido' } }
            }
        },
        // Service Order routes
        '/api/service-orders': {
            get: {
                summary: 'Listar ordens de serviço',
                tags: ['Service Orders'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer' } },
                    { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'in_progress', 'waiting_parts', 'waiting_client', 'completed', 'cancelled'] } },
                    { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] } }
                ],
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceOrderListResponse' } } } }
                }
            },
            post: {
                summary: 'Criar nova ordem de serviço',
                tags: ['Service Orders'],
                security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceOrderCreate' } } } },
                responses: {
                    '201': { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceOrderOneResponse' } } } }
                }
            }
        },
        '/api/service-orders/stats': {
            get: {
                summary: 'Obter estatísticas de ordens de serviço',
                tags: ['Service Orders'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceOrderStatsResponse' } } } }
                }
            }
        },
        '/api/service-orders/{id}': {
            get: {
                summary: 'Obter ordem de serviço por ID',
                tags: ['Service Orders'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceOrderOneResponse' } } } },
                    '404': { description: 'Não encontrado' }
                }
            },
            put: {
                summary: 'Atualizar ordem de serviço',
                tags: ['Service Orders'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceOrderUpdate' } } } },
                responses: {
                    '200': { description: 'Atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceOrderOneResponse' } } } }
                }
            },
            delete: {
                summary: 'Remover ordem de serviço',
                tags: ['Service Orders'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { '204': { description: 'Removido' } }
            }
        },
        // Comments routes
        '/api/comments': {
            get: {
                summary: 'Listar comentários com filtros',
                tags: ['Comments'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'resourceType', in: 'query', schema: { type: 'string', enum: ['ticket', 'service_order'] } },
                    { name: 'resourceId', in: 'query', schema: { type: 'integer' } },
                    { name: 'userId', in: 'query', schema: { type: 'integer' } },
                    { name: 'isInternal', in: 'query', schema: { type: 'boolean' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } }
                ],
                responses: {
                    '200': {
                        description: 'Lista de comentários',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                comments: { type: 'array', items: { $ref: '#/components/schemas/Comment' } },
                                                total: { type: 'integer' },
                                                page: { type: 'integer' },
                                                limit: { type: 'integer' },
                                                totalPages: { type: 'integer' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: 'Criar novo comentário',
                tags: ['Comments'],
                security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCommentRequest' } } } },
                responses: {
                    '201': {
                        description: 'Comentário criado com sucesso',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/Comment' } } } } }
                    },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autorizado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/api/comments/recent': {
            get: {
                summary: 'Obter comentários recentes',
                tags: ['Comments'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 } }],
                responses: {
                    '200': {
                        description: 'Lista de comentários recentes',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'array', items: { $ref: '#/components/schemas/Comment' } } } } } }
                    }
                }
            }
        },
        '/api/comments/{resourceType}/{resourceId}': {
            get: {
                summary: 'Obter comentários de um recurso específico',
                tags: ['Comments'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'resourceType', in: 'path', required: true, schema: { type: 'string', enum: ['ticket', 'service_order'] } },
                    { name: 'resourceId', in: 'path', required: true, schema: { type: 'integer' } },
                    { name: 'includeInternal', in: 'query', schema: { type: 'boolean', default: true } }
                ],
                responses: {
                    '200': {
                        description: 'Lista de comentários do recurso',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'array', items: { $ref: '#/components/schemas/Comment' } } } } } }
                    }
                }
            }
        },
        '/api/comments/{resourceType}/{resourceId}/count': {
            get: {
                summary: 'Obter contagem de comentários de um recurso',
                tags: ['Comments'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'resourceType', in: 'path', required: true, schema: { type: 'string', enum: ['ticket', 'service_order'] } },
                    { name: 'resourceId', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    '200': {
                        description: 'Contagem de comentários',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: { type: 'object', properties: { count: { type: 'integer' } } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/comments/{id}': {
            get: {
                summary: 'Obter comentário por ID',
                tags: ['Comments'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    '200': {
                        description: 'Comentário encontrado',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/Comment' } } } } }
                    },
                    '404': { description: 'Comentário não encontrado' }
                }
            },
            put: {
                summary: 'Atualizar comentário',
                tags: ['Comments'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateCommentRequest' } } } },
                responses: {
                    '200': {
                        description: 'Comentário atualizado com sucesso',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/Comment' } } } } }
                    },
                    '400': { description: 'Dados inválidos' },
                    '403': { description: 'Não autorizado' },
                    '404': { description: 'Comentário não encontrado' }
                }
            },
            delete: {
                summary: 'Excluir comentário',
                tags: ['Comments'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    '200': { description: 'Comentário excluído com sucesso' },
                    '403': { description: 'Não autorizado' },
                    '404': { description: 'Comentário não encontrado' }
                }
            }
        },
        // AI routes
        '/api/ai/analyze-ticket': {
            post: {
                summary: 'Analisa um ticket e sugere prioridade usando IA',
                tags: ['AI'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title', 'description', 'category', 'providerId'],
                                properties: {
                                    title: { type: 'string', description: 'Título do ticket' },
                                    description: { type: 'string', description: 'Descrição detalhada do problema' },
                                    category: {
                                        type: 'string',
                                        enum: ['technical', 'incident', 'maintenance', 'installation', 'billing', 'commercial', 'complaint', 'request', 'change', 'other'],
                                        description: 'Categoria do ticket'
                                    },
                                    providerId: { type: 'integer', description: 'ID do provedor' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Análise concluída com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TicketAnalysisResponse' }
                            }
                        }
                    },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autorizado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/api/ai/predict-failures/{providerId}': {
            get: {
                summary: 'Prevê falhas em equipamentos usando IA',
                tags: ['AI'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do provedor' }
                ],
                responses: {
                    '200': {
                        description: 'Previsão concluída com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/FailurePredictionResponse' }
                            }
                        }
                    },
                    '400': { description: 'ID do provedor inválido' },
                    '401': { description: 'Não autorizado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/api/ai/insights/{providerId}': {
            get: {
                summary: 'Obtém insights de IA para dashboard',
                tags: ['AI'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do provedor' }
                ],
                responses: {
                    '200': {
                        description: 'Insights obtidos com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AIInsightsResponse' }
                            }
                        }
                    },
                    '400': { description: 'ID do provedor inválido' },
                    '401': { description: 'Não autorizado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        // ML routes
        '/api/ai/ml/train/{providerId}': {
            post: {
                summary: 'Treina o modelo de ML com dados históricos',
                tags: ['AI - Machine Learning'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do provedor' }
                ],
                responses: {
                    '200': {
                        description: 'Treinamento concluído com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                modelId: { type: 'string' },
                                                accuracy: { type: 'number' },
                                                trainingTime: { type: 'number' },
                                                samplesProcessed: { type: 'integer' }
                                            }
                                        },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'ID do provedor inválido' },
                    '401': { description: 'Não autorizado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/api/ai/ml/classify-ticket': {
            post: {
                summary: 'Classifica um ticket usando ML',
                tags: ['AI - Machine Learning'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title', 'description', 'providerId'],
                                properties: {
                                    title: { type: 'string', description: 'Título do ticket' },
                                    description: { type: 'string', description: 'Descrição do ticket' },
                                    providerId: { type: 'integer', description: 'ID do provedor' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Classificação concluída com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                category: { type: 'string' },
                                                priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                                                confidence: { type: 'number', minimum: 0, maximum: 1 },
                                                estimatedResolutionTime: { type: 'number' }
                                            }
                                        },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autorizado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/api/ai/ml/historical-patterns/{providerId}': {
            get: {
                summary: 'Analisa padrões históricos usando ML',
                tags: ['AI - Machine Learning'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do provedor' },
                    { name: 'days', in: 'query', schema: { type: 'integer', default: 30 }, description: 'Número de dias para análise' }
                ],
                responses: {
                    '200': {
                        description: 'Análise concluída com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                patterns: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            category: { type: 'string' },
                                                            frequency: { type: 'number' },
                                                            avgResolutionTime: { type: 'number' },
                                                            trend: { type: 'string', enum: ['increasing', 'decreasing', 'stable'] }
                                                        }
                                                    }
                                                },
                                                predictions: {
                                                    type: 'object',
                                                    properties: {
                                                        nextWeekVolume: { type: 'integer' },
                                                        peakHours: { type: 'array', items: { type: 'integer' } },
                                                        riskFactors: { type: 'array', items: { type: 'string' } }
                                                    }
                                                }
                                            }
                                        },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'ID do provedor inválido' },
                    '401': { description: 'Não autorizado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        // Equipment Health routes
        '/api/ai/equipment/health/{providerId}': {
            get: {
                summary: 'Analisa saúde dos equipamentos',
                tags: ['AI - Equipment Health'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do provedor' }
                ],
                responses: {
                    '200': {
                        description: 'Análise concluída com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    equipmentId: { type: 'integer' },
                                                    healthScore: { type: 'number', minimum: 0, maximum: 100 },
                                                    status: { type: 'string', enum: ['healthy', 'warning', 'critical'] },
                                                    lastCheck: { type: 'string', format: 'date-time' },
                                                    issues: { type: 'array', items: { type: 'string' } },
                                                    recommendations: { type: 'array', items: { type: 'string' } }
                                                }
                                            }
                                        },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'ID do provedor inválido' },
                    '401': { description: 'Não autorizado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/api/ai/equipment/predict-failure/{equipmentId}': {
            get: {
                summary: 'Prevê falha específica de equipamento',
                tags: ['AI - Equipment Health'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'equipmentId', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do equipamento' }
                ],
                responses: {
                    '200': {
                        description: 'Previsão concluída com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                equipmentId: { type: 'integer' },
                                                failureProbability: { type: 'number', minimum: 0, maximum: 1 },
                                                estimatedFailureDate: { type: 'string', format: 'date-time', nullable: true },
                                                riskLevel: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                                                contributingFactors: { type: 'array', items: { type: 'string' } },
                                                preventiveMeasures: { type: 'array', items: { type: 'string' } }
                                            }
                                        },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    '404': { description: 'Equipamento não encontrado' },
                    '401': { description: 'Não autorizado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/api/ai/equipment/maintenance-schedule/{providerId}': {
            get: {
                summary: 'Gera cronograma de manutenção preditiva',
                tags: ['AI - Equipment Health'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do provedor' },
                    { name: 'days', in: 'query', schema: { type: 'integer', default: 30 }, description: 'Período em dias' }
                ],
                responses: {
                    '200': {
                        description: 'Cronograma gerado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    equipmentId: { type: 'integer' },
                                                    scheduledDate: { type: 'string', format: 'date-time' },
                                                    maintenanceType: { type: 'string', enum: ['preventive', 'corrective', 'emergency'] },
                                                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                                                    estimatedDuration: { type: 'number' },
                                                    description: { type: 'string' },
                                                    requiredParts: { type: 'array', items: { type: 'string' } }
                                                }
                                            }
                                        },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'ID do provedor inválido' },
                    '401': { description: 'Não autorizado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/api/ai/equipment/anomalies/{providerId}': {
            get: {
                summary: 'Detecta anomalias em equipamentos',
                tags: ['AI - Equipment Health'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do provedor' }
                ],
                responses: {
                    '200': {
                        description: 'Detecção concluída com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    equipmentId: { type: 'integer' },
                                                    anomalyType: { type: 'string' },
                                                    severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                                                    detectedAt: { type: 'string', format: 'date-time' },
                                                    description: { type: 'string' },
                                                    possibleCauses: { type: 'array', items: { type: 'string' } },
                                                    recommendedActions: { type: 'array', items: { type: 'string' } }
                                                }
                                            }
                                        },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'ID do provedor inválido' },
                    '401': { description: 'Não autorizado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        // Intelligent Chat routes
        '/api/ai/chat/start': {
            post: {
                summary: 'Inicia uma sessão de chat inteligente',
                tags: ['AI - Intelligent Chat'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['providerId', 'userId'],
                                properties: {
                                    providerId: { type: 'integer', description: 'ID do provedor' },
                                    userId: { type: 'integer', description: 'ID do usuário' },
                                    context: { type: 'string', description: 'Contexto inicial da conversa' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Sessão iniciada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                sessionId: { type: 'string' },
                                                startedAt: { type: 'string', format: 'date-time' },
                                                welcomeMessage: { type: 'string' }
                                            }
                                        },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autorizado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/api/ai/chat/message': {
            post: {
                summary: 'Processa uma mensagem no chat inteligente',
                tags: ['AI - Intelligent Chat'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['sessionId', 'message'],
                                properties: {
                                    sessionId: { type: 'string', description: 'ID da sessão' },
                                    message: { type: 'string', description: 'Mensagem do usuário' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Mensagem processada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                response: { type: 'string' },
                                                intent: { type: 'string' },
                                                confidence: { type: 'number', minimum: 0, maximum: 1 },
                                                suggestedActions: { type: 'array', items: { type: 'string' } },
                                                relatedTickets: { type: 'array', items: { type: 'integer' } }
                                            }
                                        },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Dados inválidos' },
                    '404': { description: 'Sessão não encontrada' },
                    '401': { description: 'Não autorizado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/api/ai/chat/solution': {
            post: {
                summary: 'Busca solução automática para problema',
                tags: ['AI - Intelligent Chat'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['problem', 'providerId'],
                                properties: {
                                    problem: { type: 'string', description: 'Descrição do problema' },
                                    providerId: { type: 'integer', description: 'ID do provedor' },
                                    category: { type: 'string', description: 'Categoria do problema' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Solução encontrada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                solution: { type: 'string' },
                                                steps: { type: 'array', items: { type: 'string' } },
                                                confidence: { type: 'number', minimum: 0, maximum: 1 },
                                                estimatedTime: { type: 'number' },
                                                relatedKnowledge: { type: 'array', items: { type: 'string' } }
                                            }
                                        },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autorizado' },
                    '404': { description: 'Solução não encontrada' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/api/ai/chat/suggestions/{providerId}': {
            get: {
                summary: 'Gera sugestões proativas',
                tags: ['AI - Intelligent Chat'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do provedor' }
                ],
                responses: {
                    '200': {
                        description: 'Sugestões geradas com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    type: { type: 'string', enum: ['maintenance', 'optimization', 'alert', 'recommendation'] },
                                                    title: { type: 'string' },
                                                    description: { type: 'string' },
                                                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                                                    action: { type: 'string' },
                                                    estimatedImpact: { type: 'string' }
                                                }
                                            }
                                        },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'ID do provedor inválido' },
                    '401': { description: 'Não autorizado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/api/ai/chat/end/{sessionId}': {
            post: {
                summary: 'Encerra uma sessão de chat',
                tags: ['AI - Intelligent Chat'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'sessionId', in: 'path', required: true, schema: { type: 'string' }, description: 'ID da sessão' }
                ],
                responses: {
                    '200': {
                        description: 'Sessão encerrada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                sessionId: { type: 'string' },
                                                duration: { type: 'number' },
                                                messageCount: { type: 'integer' },
                                                summary: { type: 'string' }
                                            }
                                        },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    '404': { description: 'Sessão não encontrada' },
                    '401': { description: 'Não autorizado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        // Dashboard routes
        '/api/dashboard/{providerId}': {
            get: {
                summary: 'Obter dados do dashboard',
                tags: ['Dashboard'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'providerId', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/DashboardResponse' } } } }
                }
            }
        }
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            ApiResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' }
                }
            },
            PaginationMeta: {
                type: 'object',
                properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' },
                    hasNext: { type: 'boolean' },
                    hasPrev: { type: 'boolean' }
                }
            },
            // Equipments
            Equipment: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    label: { type: 'string' },
                    type: { type: 'string', enum: ['switch', 'olt', 'router', 'server', 'virtualizer', 'other'] },
                    serial: { type: 'string' },
                    status: { type: 'string', enum: ['active', 'inactive', 'maintenance'] },
                    providerId: { type: 'integer' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                },
                required: ['label', 'type', 'status', 'providerId']
            },
            EquipmentCreate: {
                type: 'object',
                properties: {
                    label: { type: 'string' },
                    type: { type: 'string', enum: ['switch', 'olt', 'router', 'server', 'virtualizer', 'other'] },
                    serial: { type: 'string' },
                    status: { type: 'string', enum: ['active', 'inactive', 'maintenance'] }
                },
                required: ['label', 'type', 'status']
            },
            EquipmentUpdate: {
                type: 'object',
                properties: {
                    label: { type: 'string' },
                    type: { type: 'string', enum: ['switch', 'olt', 'router', 'server', 'virtualizer', 'other'] },
                    serial: { type: 'string' },
                    status: { type: 'string', enum: ['active', 'inactive', 'maintenance'] }
                }
            },
            EquipmentStats: {
                type: 'object',
                properties: {
                    total: { type: 'integer' },
                    byType: { type: 'object', additionalProperties: { type: 'integer' } }
                }
            },
            EquipmentListResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Equipment' } },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' },
                    message: { type: 'string' }
                }
            },
            EquipmentOneResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Equipment' },
                    message: { type: 'string' }
                }
            },
            EquipmentStatsResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/EquipmentStats' },
                    message: { type: 'string' }
                }
            },
            // Providers
            Provider: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    workspace: { type: 'string' },
                    cnpj: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string' },
                    status: { type: 'string', enum: ['active', 'inactive'] },
                    plan: { type: 'string', enum: ['basic', 'professional', 'enterprise'] },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            ProviderCreate: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    cnpj: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string' },
                    address: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    zipCode: { type: 'string' },
                    workspace: { type: 'string' },
                    plan: { type: 'string', enum: ['basic', 'professional', 'enterprise'] }
                },
                required: ['name', 'cnpj', 'email']
            },
            ProviderUpdate: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    cnpj: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string' },
                    address: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    zipCode: { type: 'string' },
                    workspace: { type: 'string' },
                    plan: { type: 'string', enum: ['basic', 'professional', 'enterprise'] }
                }
            },
            ProviderStats: {
                type: 'object',
                properties: {
                    totalUsers: { type: 'integer' },
                    activeUsers: { type: 'integer' },
                    totalEquipments: { type: 'integer' },
                    onlineEquipments: { type: 'integer' },
                    totalTickets: { type: 'integer' },
                    openTickets: { type: 'integer' },
                    resolvedTickets: { type: 'integer' },
                    averageResolutionTime: { type: 'number' },
                    customerSatisfaction: { type: 'number' },
                    storageUsed: { type: 'number' },
                    apiCallsThisMonth: { type: 'integer' },
                    lastBackup: { type: 'string', format: 'date-time' }
                }
            },
            ProviderUser: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    userId: { type: 'integer' },
                    providerId: { type: 'integer' },
                    role: { type: 'string', enum: ['admin', 'manager', 'technician', 'viewer'] },
                    permissions: { type: 'array', items: { type: 'string' } },
                    status: { type: 'string', enum: ['active', 'inactive'] },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            ProviderInvite: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    providerId: { type: 'integer' },
                    email: { type: 'string' },
                    role: { type: 'string', enum: ['admin', 'manager', 'technician', 'viewer'] },
                    permissions: { type: 'array', items: { type: 'string' } },
                    invitedBy: { type: 'integer' },
                    invitedAt: { type: 'string', format: 'date-time' }
                }
            },
            ProviderSettings: {
                type: 'object',
                properties: {
                    ticket: { type: 'object' },
                    notification: { type: 'object' },
                    security: { type: 'object' },
                    integration: { type: 'object' },
                    branding: { type: 'object' }
                }
            },
            ProviderListResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Provider' } },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' },
                    message: { type: 'string' }
                }
            },
            ProviderOneResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Provider' },
                    message: { type: 'string' }
                }
            },
            ProviderStatsResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/ProviderStats' },
                    message: { type: 'string' }
                }
            },
            WorkspaceAvailabilityResponse: {
                type: 'object',
                properties: {
                    workspace: { type: 'string' },
                    available: { type: 'boolean' }
                }
            },
            // Password Vault
            PasswordVaultRecord: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    label: { type: 'string' },
                    username: { type: 'string' },
                    password: { type: 'string' },
                    providerId: { type: 'integer' },
                    expiresAt: { type: 'string', format: 'date-time', nullable: true },
                    lastRotatedAt: { type: 'string', format: 'date-time', nullable: true },
                    rotationIntervalDays: { type: 'integer', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            PasswordVaultItem: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    label: { type: 'string' },
                    username: { type: 'string' },
                    providerId: { type: 'integer' },
                    expiresAt: { type: 'string', format: 'date-time', nullable: true },
                    lastRotatedAt: { type: 'string', format: 'date-time', nullable: true },
                    rotationIntervalDays: { type: 'integer', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            PasswordVaultCreate: {
                type: 'object',
                properties: {
                    label: { type: 'string' },
                    username: { type: 'string' },
                    password: { type: 'string' },
                    expiresAt: { type: 'string', format: 'date-time' },
                    rotationIntervalDays: { type: 'integer' }
                },
                required: ['label', 'username', 'password']
            },
            PasswordVaultUpdate: {
                type: 'object',
                properties: {
                    label: { type: 'string' },
                    username: { type: 'string' },
                    password: { type: 'string' },
                    expiresAt: { type: 'string', format: 'date-time' },
                    rotationIntervalDays: { type: 'integer' },
                    lastRotatedAt: { type: 'string', format: 'date-time' }
                }
            },
            PasswordRotateRequest: {
                type: 'object',
                properties: {
                    password: { type: 'string' },
                    length: { type: 'integer' },
                    includeUppercase: { type: 'boolean' },
                    includeLowercase: { type: 'boolean' },
                    includeNumbers: { type: 'boolean' },
                    includeSymbols: { type: 'boolean' },
                    excludeSimilar: { type: 'boolean' },
                    excludeAmbiguous: { type: 'boolean' },
                    customCharacters: { type: 'string' },
                    pattern: { type: 'string' }
                }
            },
            PasswordVaultListResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/PasswordVaultItem' } },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' },
                    message: { type: 'string' }
                }
            },
            PasswordVaultOneResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/PasswordVaultRecord' },
                    message: { type: 'string' }
                }
            },
            // Tickets
            Ticket: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    number: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed', 'cancelled'] },
                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                    category: { type: 'string', enum: ['technical', 'billing', 'commercial', 'installation', 'maintenance', 'complaint', 'request', 'incident', 'change', 'other'] },
                    source: { type: 'string', enum: ['manual', 'email', 'phone', 'chat', 'portal', 'api', 'zabbix', 'mobile', 'social', 'other'] },
                    customerName: { type: 'string' },
                    customerEmail: { type: 'string' },
                    customerPhone: { type: 'string' },
                    providerId: { type: 'integer' },
                    assignedTo: { type: 'integer', nullable: true },
                    dueDate: { type: 'string', format: 'date-time', nullable: true },
                    resolvedAt: { type: 'string', format: 'date-time', nullable: true },
                    closedAt: { type: 'string', format: 'date-time', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                },
                required: ['title', 'description', 'status', 'priority', 'category', 'customerName', 'customerEmail', 'providerId']
            },
            TicketCreate: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                    category: { type: 'string', enum: ['technical', 'billing', 'commercial', 'installation', 'maintenance', 'complaint', 'request', 'incident', 'change', 'other'] },
                    source: { type: 'string', enum: ['manual', 'email', 'phone', 'chat', 'portal', 'api', 'zabbix', 'mobile', 'social', 'other'] },
                    customerName: { type: 'string' },
                    customerEmail: { type: 'string' },
                    customerPhone: { type: 'string' },
                    assignedTo: { type: 'integer', nullable: true },
                    dueDate: { type: 'string', format: 'date-time', nullable: true }
                },
                required: ['title', 'description', 'priority', 'category', 'customerName', 'customerEmail']
            },
            TicketUpdate: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed', 'cancelled'] },
                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                    category: { type: 'string', enum: ['technical', 'billing', 'commercial', 'installation', 'maintenance', 'complaint', 'request', 'incident', 'change', 'other'] },
                    customerName: { type: 'string' },
                    customerEmail: { type: 'string' },
                    customerPhone: { type: 'string' },
                    assignedTo: { type: 'integer', nullable: true },
                    dueDate: { type: 'string', format: 'date-time', nullable: true }
                }
            },
            TicketStats: {
                type: 'object',
                properties: {
                    total: { type: 'integer' },
                    open: { type: 'integer' },
                    assigned: { type: 'integer' },
                    inProgress: { type: 'integer' },
                    pending: { type: 'integer' },
                    resolved: { type: 'integer' },
                    closed: { type: 'integer' },
                    cancelled: { type: 'integer' },
                    byPriority: { type: 'object', additionalProperties: { type: 'integer' } },
                    byCategory: { type: 'object', additionalProperties: { type: 'integer' } },
                    averageResolutionTime: { type: 'number' },
                    overdueTickets: { type: 'integer' }
                }
            },
            TicketListResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Ticket' } },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' },
                    message: { type: 'string' }
                }
            },
            TicketOneResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Ticket' },
                    message: { type: 'string' }
                }
            },
            TicketStatsResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/TicketStats' },
                    message: { type: 'string' }
                }
            },
            // Service Orders
            ServiceOrder: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['pending', 'in_progress', 'waiting_parts', 'waiting_client', 'completed', 'cancelled'] },
                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                    scheduledDate: { type: 'string', format: 'date-time', nullable: true },
                    startedAt: { type: 'string', format: 'date-time', nullable: true },
                    completedAt: { type: 'string', format: 'date-time', nullable: true },
                    estimatedHours: { type: 'number', nullable: true },
                    actualHours: { type: 'number', nullable: true },
                    cost: { type: 'number', nullable: true },
                    notes: { type: 'string', nullable: true },
                    providerId: { type: 'integer' },
                    ticketId: { type: 'integer', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                },
                required: ['title', 'description', 'status', 'priority', 'providerId']
            },
            ServiceOrderCreate: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['pending', 'in_progress', 'waiting_parts', 'waiting_client', 'completed', 'cancelled'] },
                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                    scheduledDate: { type: 'string', format: 'date-time', nullable: true },
                    estimatedHours: { type: 'number', nullable: true },
                    cost: { type: 'number', nullable: true },
                    notes: { type: 'string', nullable: true },
                    ticketId: { type: 'integer', nullable: true }
                },
                required: ['title', 'description']
            },
            ServiceOrderUpdate: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['pending', 'in_progress', 'waiting_parts', 'waiting_client', 'completed', 'cancelled'] },
                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                    scheduledDate: { type: 'string', format: 'date-time', nullable: true },
                    estimatedHours: { type: 'number', nullable: true },
                    actualHours: { type: 'number', nullable: true },
                    cost: { type: 'number', nullable: true },
                    notes: { type: 'string', nullable: true },
                    ticketId: { type: 'integer', nullable: true }
                }
            },
            ServiceOrderStats: {
                type: 'object',
                properties: {
                    total: { type: 'integer' },
                    byStatus: { type: 'object', additionalProperties: { type: 'integer' } },
                    byPriority: { type: 'object', additionalProperties: { type: 'integer' } },
                    averageCompletionTime: { type: 'number' },
                    totalRevenue: { type: 'number' },
                    pendingRevenue: { type: 'number' }
                }
            },
            ServiceOrderListResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/ServiceOrder' } },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' },
                    message: { type: 'string' }
                }
            },
            ServiceOrderOneResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/ServiceOrder' },
                    message: { type: 'string' }
                }
            },
            ServiceOrderStatsResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/ServiceOrderStats' },
                    message: { type: 'string' }
                }
            },
            // Comments
            Comment: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    content: { type: 'string' },
                    resourceType: { type: 'string', enum: ['ticket', 'service_order'] },
                    resourceId: { type: 'integer' },
                    isInternal: { type: 'boolean' },
                    isEdited: { type: 'boolean' },
                    editedAt: { type: 'string', format: 'date-time', nullable: true },
                    userId: { type: 'integer' },
                    providerId: { type: 'integer' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            CreateCommentRequest: {
                type: 'object',
                required: ['content', 'resourceType', 'resourceId'],
                properties: {
                    content: { type: 'string', minLength: 1, maxLength: 5000 },
                    resourceType: { type: 'string', enum: ['ticket', 'service_order'] },
                    resourceId: { type: 'integer', minimum: 1 },
                    isInternal: { type: 'boolean', default: false }
                }
            },
            UpdateCommentRequest: {
                type: 'object',
                properties: {
                    content: { type: 'string', minLength: 1, maxLength: 5000 },
                    isInternal: { type: 'boolean' }
                }
            },
            // Dashboard
            DashboardOverview: {
                type: 'object',
                properties: {
                    totalEquipments: { type: 'integer' },
                    totalTickets: { type: 'integer' },
                    totalPasswords: { type: 'integer' },
                    openTickets: { type: 'integer' },
                    criticalTickets: { type: 'integer' },
                    activeEquipments: { type: 'integer' }
                }
            },
            DashboardData: {
                type: 'object',
                properties: {
                    overview: { $ref: '#/components/schemas/DashboardOverview' },
                    recentActivities: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                type: { type: 'string', enum: ['ticket', 'equipment', 'password'] },
                                id: { type: 'integer' },
                                title: { type: 'string' },
                                description: { type: 'string', nullable: true },
                                createdAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            },
            DashboardResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/DashboardData' },
                    message: { type: 'string' }
                }
            },
            // AI Schemas
            TicketAnalysisResult: {
                type: 'object',
                properties: {
                    suggestedPriority: {
                        type: 'string',
                        enum: ['low', 'medium', 'high', 'critical'],
                        description: 'Prioridade sugerida pela IA'
                    },
                    confidence: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1,
                        description: 'Nível de confiança da análise (0-1)'
                    },
                    reasoning: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Razões que levaram à sugestão de prioridade'
                    },
                    historicalPatterns: {
                        type: 'object',
                        properties: {
                            similarTickets: { type: 'integer', description: 'Número de tickets similares encontrados' },
                            averageResolutionTime: { type: 'number', description: 'Tempo médio de resolução em horas' },
                            commonResolution: { type: 'string', nullable: true, description: 'Resolução mais comum' }
                        }
                    }
                }
            },
            TicketAnalysisResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/TicketAnalysisResult' },
                    message: { type: 'string' }
                }
            },
            EquipmentFailurePrediction: {
                type: 'object',
                properties: {
                    equipmentId: { type: 'integer' },
                    riskLevel: {
                        type: 'string',
                        enum: ['low', 'medium', 'high', 'critical'],
                        description: 'Nível de risco de falha'
                    },
                    probability: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1,
                        description: 'Probabilidade de falha (0-1)'
                    },
                    predictedFailureDate: {
                        type: 'string',
                        format: 'date-time',
                        nullable: true,
                        description: 'Data prevista para falha'
                    },
                    recommendedActions: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Ações recomendadas'
                    },
                    factors: {
                        type: 'object',
                        properties: {
                            age: { type: 'number', description: 'Idade do equipamento em anos' },
                            ticketFrequency: { type: 'number', description: 'Frequência de tickets nos últimos 90 dias' },
                            lastMaintenanceDate: { type: 'string', format: 'date-time', nullable: true },
                            criticalIssues: { type: 'number', description: 'Número de problemas críticos recentes' }
                        }
                    }
                }
            },
            FailurePredictionResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: {
                        type: 'object',
                        properties: {
                            predictions: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/EquipmentFailurePrediction' }
                            },
                            summary: {
                                type: 'object',
                                properties: {
                                    totalEquipments: { type: 'integer' },
                                    criticalRisk: { type: 'integer' },
                                    highRisk: { type: 'integer' },
                                    mediumRisk: { type: 'integer' }
                                }
                            }
                        }
                    },
                    message: { type: 'string' }
                }
            },
            AIInsights: {
                type: 'object',
                properties: {
                    equipmentHealth: {
                        type: 'object',
                        properties: {
                            totalAnalyzed: { type: 'integer' },
                            riskDistribution: {
                                type: 'object',
                                properties: {
                                    critical: { type: 'integer' },
                                    high: { type: 'integer' },
                                    medium: { type: 'integer' },
                                    low: { type: 'integer' }
                                }
                            },
                            upcomingFailures: { type: 'integer' }
                        }
                    },
                    recommendations: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                type: { type: 'string' },
                                title: { type: 'string' },
                                description: { type: 'string' },
                                action: { type: 'string' },
                                priority: { type: 'string' }
                            }
                        }
                    },
                    alerts: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                type: { type: 'string' },
                                severity: { type: 'string' },
                                title: { type: 'string' },
                                message: { type: 'string' },
                                equipments: { type: 'array', items: { type: 'integer' } },
                                timestamp: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            },
            AIInsightsResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/AIInsights' },
                    message: { type: 'string' }
                }
            }
        }
    }
};
exports.default = openapiSpec;
