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