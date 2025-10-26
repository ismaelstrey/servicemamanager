import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';

// Gera a especificação OpenAPI a partir de comentários @swagger nas rotas/controllers
// Funciona tanto em dev (TS) quanto no build (JS) graças aos padrões abaixo
const apiFilesPatterns = [
  // Docs centralizados (src e dist)
  path.join(__dirname, './*.ts'),
  path.join(__dirname, './**/*.ts'),
  path.join(__dirname, './*.js'),
  path.join(__dirname, './**/*.js'),
  // Quando executando em dist, também ler diretamente de src/docs
  path.join(__dirname, '../../src/docs/*.ts'),
  path.join(__dirname, '../../src/docs/**/*.ts'),
  // Rotas em TypeScript
  path.join(__dirname, '../routes/*.ts'),
  path.join(__dirname, '../routes/**/*.ts'),
  // Rotas em JavaScript (dist)
  path.join(__dirname, '../routes/*.js'),
  path.join(__dirname, '../routes/**/*.js'),
  // Controllers em TS/JS (caso contenham @swagger)
  path.join(__dirname, '../controllers/*.ts'),
  path.join(__dirname, '../controllers/**/*.ts'),
  path.join(__dirname, '../controllers/*.js'),
  path.join(__dirname, '../controllers/**/*.js'),
];

const options: swaggerJSDoc.Options = {
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

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;