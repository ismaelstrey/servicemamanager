"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
// Gera a especificação OpenAPI a partir de comentários @swagger nas rotas/controllers
// Funciona tanto em dev (TS) quanto no build (JS) graças aos padrões abaixo
const apiFilesPatterns = [
    // Docs centralizados (src e dist)
    path_1.default.join(__dirname, './*.ts'),
    path_1.default.join(__dirname, './**/*.ts'),
    path_1.default.join(__dirname, './*.js'),
    path_1.default.join(__dirname, './**/*.js'),
    // Quando executando em dist, também ler diretamente de src/docs
    path_1.default.join(__dirname, '../../src/docs/*.ts'),
    path_1.default.join(__dirname, '../../src/docs/**/*.ts'),
    // Rotas em TypeScript
    path_1.default.join(__dirname, '../routes/*.ts'),
    path_1.default.join(__dirname, '../routes/**/*.ts'),
    // Rotas em JavaScript (dist)
    path_1.default.join(__dirname, '../routes/*.js'),
    path_1.default.join(__dirname, '../routes/**/*.js'),
    // Controllers em TS/JS (caso contenham @swagger)
    path_1.default.join(__dirname, '../controllers/*.ts'),
    path_1.default.join(__dirname, '../controllers/**/*.ts'),
    path_1.default.join(__dirname, '../controllers/*.js'),
    path_1.default.join(__dirname, '../controllers/**/*.js'),
];
const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'TelecomAI Backend API',
            version: '1.0.0',
            description: 'Documentação da API do backend (gerada automaticamente a partir das rotas)'
        },
        servers: [
            { url: 'http://localhost:4002', description: 'Container local' },
            { url: 'http://localhost:4000', description: 'Dev local (ts-node-dev)' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: apiFilesPatterns,
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
