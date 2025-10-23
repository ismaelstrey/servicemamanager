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
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['switch','olt','router','server','virtualizer','other'] } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active','inactive','maintenance'] } }
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
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['open','assigned','in_progress','pending','resolved','closed','cancelled'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low','medium','high','critical'] } }
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
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending','in_progress','waiting_parts','waiting_client','completed','cancelled'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low','medium','high','urgent'] } }
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
      },
      // Tickets
      Ticket: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          number: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['open','assigned','in_progress','pending','resolved','closed','cancelled'] },
          priority: { type: 'string', enum: ['low','medium','high','critical'] },
          category: { type: 'string', enum: ['technical','billing','commercial','installation','maintenance','complaint','request','incident','change','other'] },
          source: { type: 'string', enum: ['manual','email','phone','chat','portal','api','zabbix','mobile','social','other'] },
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
        required: ['title','description','status','priority','category','customerName','customerEmail','providerId']
      },
      TicketCreate: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['low','medium','high','critical'] },
          category: { type: 'string', enum: ['technical','billing','commercial','installation','maintenance','complaint','request','incident','change','other'] },
          source: { type: 'string', enum: ['manual','email','phone','chat','portal','api','zabbix','mobile','social','other'] },
          customerName: { type: 'string' },
          customerEmail: { type: 'string' },
          customerPhone: { type: 'string' },
          assignedTo: { type: 'integer', nullable: true },
          dueDate: { type: 'string', format: 'date-time', nullable: true }
        },
        required: ['title','description','priority','category','customerName','customerEmail']
      },
      TicketUpdate: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['open','assigned','in_progress','pending','resolved','closed','cancelled'] },
          priority: { type: 'string', enum: ['low','medium','high','critical'] },
          category: { type: 'string', enum: ['technical','billing','commercial','installation','maintenance','complaint','request','incident','change','other'] },
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
          status: { type: 'string', enum: ['pending','in_progress','waiting_parts','waiting_client','completed','cancelled'] },
          priority: { type: 'string', enum: ['low','medium','high','urgent'] },
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
        required: ['title','description','status','priority','providerId']
      },
      ServiceOrderCreate: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['pending','in_progress','waiting_parts','waiting_client','completed','cancelled'] },
          priority: { type: 'string', enum: ['low','medium','high','urgent'] },
          scheduledDate: { type: 'string', format: 'date-time', nullable: true },
          estimatedHours: { type: 'number', nullable: true },
          cost: { type: 'number', nullable: true },
          notes: { type: 'string', nullable: true },
          ticketId: { type: 'integer', nullable: true }
        },
        required: ['title','description']
      },
      ServiceOrderUpdate: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['pending','in_progress','waiting_parts','waiting_client','completed','cancelled'] },
          priority: { type: 'string', enum: ['low','medium','high','urgent'] },
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
                type: { type: 'string', enum: ['ticket','equipment','password'] },
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
      }
    }
  }
};

export default openapiSpec;