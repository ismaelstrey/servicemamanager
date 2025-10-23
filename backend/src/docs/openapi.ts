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
          type: { type: 'string', enum: ['switch','olt','router','server','virtualizer','other'] },
          serial: { type: 'string' },
          status: { type: 'string', enum: ['active','inactive','maintenance'] },
          providerId: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['label','type','status','providerId']
      },
      EquipmentCreate: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          type: { type: 'string', enum: ['switch','olt','router','server','virtualizer','other'] },
          serial: { type: 'string' },
          status: { type: 'string', enum: ['active','inactive','maintenance'] }
        },
        required: ['label','type','status']
      },
      EquipmentUpdate: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          type: { type: 'string', enum: ['switch','olt','router','server','virtualizer','other'] },
          serial: { type: 'string' },
          status: { type: 'string', enum: ['active','inactive','maintenance'] }
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
          status: { type: 'string', enum: ['active','inactive'] },
          plan: { type: 'string', enum: ['basic','professional','enterprise'] },
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
          plan: { type: 'string', enum: ['basic','professional','enterprise'] }
        },
        required: ['name','cnpj','email']
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
          plan: { type: 'string', enum: ['basic','professional','enterprise'] }
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
          role: { type: 'string', enum: ['admin','manager','technician','viewer'] },
          permissions: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['active','inactive'] },
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
          role: { type: 'string', enum: ['admin','manager','technician','viewer'] },
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
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      PasswordVaultCreate: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          username: { type: 'string' },
          password: { type: 'string' }
        },
        required: ['label','username','password']
      },
      PasswordVaultUpdate: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          username: { type: 'string' },
          password: { type: 'string' }
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
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Login do usuário',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email','password'] } } }
        },
        responses: { '200': { description: 'Sucesso' }, '401': { description: 'Credenciais inválidas' } }
      }
    },
    '/api/providers/{providerId}/equipments': {
      get: {
        summary: 'Listar equipamentos do provedor',
        parameters: [
          { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active','inactive','maintenance'] } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['switch','olt','router','server','virtualizer','other'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/EquipmentListResponse' } } } }
        }
      },
      post: {
        summary: 'Criar equipamento para provedor',
        parameters: [ { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' } } ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/EquipmentCreate' } } }
        },
        responses: {
          '201': { description: 'Criado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Equipment' }, message: { type: 'string' } } } } } }
        }
      }
    },
    '/api/providers/equipments/{id}': {
      get: {
        summary: 'Detalhar equipamento por id',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'integer' } } ],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/EquipmentOneResponse' } } } }, '404': { description: 'Não encontrado' } }
      },
      put: {
        summary: 'Atualizar equipamento por id',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'integer' } } ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/EquipmentUpdate' } } }
        },
        responses: { '200': { description: 'Atualizado' } }
      },
      delete: {
        summary: 'Remover equipamento por id',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'integer' } } ],
        responses: { '200': { description: 'Removido' } }
      }
    },
    '/api/providers/{providerId}/equipments/stats': {
      get: {
        summary: 'Estatísticas de equipamentos por provedor',
        parameters: [ { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' } } ],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/EquipmentStatsResponse' } } } } }
      }
    },
    // Providers
    '/api/providers': {
      get: {
        summary: 'Listar provedores',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active','inactive'] } },
          { name: 'plan', in: 'query', schema: { type: 'string', enum: ['basic','professional','enterprise'] } },
          { name: 'sortBy', in: 'query', schema: { type: 'string' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc','desc'] } }
        ],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProviderListResponse' } } } } }
      },
      post: {
        summary: 'Criar provedor',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ProviderCreate' } } }
        },
        responses: { '201': { description: 'Criado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Provider' }, message: { type: 'string' } } } } } } }
      }
    },
    '/api/providers/{id}': {
      get: {
        summary: 'Obter provedor por ID',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'integer' } } ],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProviderOneResponse' } } } }, '404': { description: 'Não encontrado' } }
      },
      put: {
        summary: 'Atualizar provedor',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'integer' } } ],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProviderUpdate' } } } },
        responses: { '200': { description: 'Atualizado' }, '404': { description: 'Não encontrado' } }
      },
      delete: {
        summary: 'Excluir provedor',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'integer' } } ],
        responses: { '200': { description: 'Excluído' }, '404': { description: 'Não encontrado' } }
      }
    },
    '/api/providers/workspace/{workspace}': {
      get: {
        summary: 'Obter provedor por workspace',
        parameters: [ { name: 'workspace', in: 'path', required: true, schema: { type: 'string' } } ],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProviderOneResponse' } } } }, '404': { description: 'Não encontrado' } }
      }
    },
    '/api/providers/check-workspace/{workspace}': {
      get: {
        summary: 'Checar disponibilidade de workspace (pública)',
        security: [],
        parameters: [ { name: 'workspace', in: 'path', required: true, schema: { type: 'string' } } ],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/WorkspaceAvailabilityResponse' } } } } }
      }
    },
    '/api/providers/{id}/status': {
      patch: {
        summary: 'Alterar status do provedor',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'integer' } } ],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['active','inactive'] } }, required: ['status'] } } } },
        responses: { '200': { description: 'Status alterado' }, '403': { description: 'Sem permissão' } }
      }
    },
    '/api/providers/{id}/stats': {
      get: {
        summary: 'Estatísticas do provedor',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'integer' } } ],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProviderStatsResponse' } } } }, '404': { description: 'Não encontrado' } }
      }
    },
    '/api/providers/{id}/invite': {
      post: {
        summary: 'Convidar usuário para provedor',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'integer' } } ],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, role: { type: 'string', enum: ['admin','manager','technician','viewer'] }, permissions: { type: 'array', items: { type: 'string' } } }, required: ['email','role'] } } } },
        responses: { '201': { description: 'Convite enviado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/ProviderInvite' }, message: { type: 'string' } } } } } } }
      }
    },
    '/api/providers/{id}/users': {
      get: {
        summary: 'Listar usuários do provedor',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'integer' } } ],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/ProviderUser' } }, message: { type: 'string' } } } } } } }
      }
    },
    '/api/providers/{id}/settings': {
      put: {
        summary: 'Atualizar configurações do provedor',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'integer' } } ],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProviderSettings' } } } },
        responses: { '200': { description: 'Configurações atualizadas', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Provider' }, message: { type: 'string' } } } } } } }
      }
    },
    // Password Vault
    '/api/providers/{providerId}/passwords': {
      get: {
        summary: 'Listar senhas do provedor',
        parameters: [
          { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PasswordVaultListResponse' } } } } }
      },
      post: {
        summary: 'Criar senha para provedor',
        parameters: [ { name: 'providerId', in: 'path', required: true, schema: { type: 'integer' } } ],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PasswordVaultCreate' } } } },
        responses: { '201': { description: 'Criado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/PasswordVaultRecord' }, message: { type: 'string' } } } } } } }
      }
    },
    '/api/providers/passwords/{id}': {
      get: {
        summary: 'Obter senha por ID',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'integer' } } ],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PasswordVaultOneResponse' } } } }, '404': { description: 'Não encontrado' } }
      },
      put: {
        summary: 'Atualizar senha por ID',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'integer' } } ],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PasswordVaultUpdate' } } } },
        responses: { '200': { description: 'Atualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/PasswordVaultRecord' }, message: { type: 'string' } } } } } } }
      },
      delete: {
        summary: 'Remover senha por ID',
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'integer' } } ],
        responses: { '200': { description: 'Removido' } }
      }
    }
  }
};

export default openapiSpec;