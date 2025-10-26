"use strict";
// OpenAPI Specification válido para Swagger UI
// Evita auto-referência ao dist e garante campo 'openapi' 3.x
Object.defineProperty(exports, "__esModule", { value: true });
const openapiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'TelecomAI Backend API',
        version: '1.0.0',
        description: 'Documentação da API do backend (ambiente local)'
    },
    servers: [
        { url: 'http://localhost:4002', description: 'Container local' },
        { url: 'http://localhost:4000', description: 'Dev local (ts-node-dev)' }
    ],
    tags: [
        { name: 'Auth', description: 'Autenticação e registro' },
        { name: 'Providers', description: 'Operações de provedores' },
        { name: 'Service Orders', description: 'Ordens de serviço do cliente' },
        { name: 'Tickets', description: 'Tickets do cliente' },
        { name: 'Comments', description: 'Comentários' },
        { name: 'AI', description: 'Operações de IA' }
    ],
    paths: {
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login do usuário',
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
                    '200': { description: 'Login bem-sucedido' },
                    '400': { description: 'Requisição inválida' },
                    '401': { description: 'Credenciais inválidas' }
                }
            }
        },
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Registro de usuário',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string' }
                                },
                                required: ['email', 'password']
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Usuário registrado' },
                    '400': { description: 'Requisição inválida' }
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
        }
    }
};
exports.default = openapiSpec;
