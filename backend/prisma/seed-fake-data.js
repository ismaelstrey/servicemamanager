const { PrismaClient, $Enums } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { faker } = require('@faker-js/faker/locale/pt_BR');

const prisma = new PrismaClient();

// Configurações
const NUM_USERS = 10;
const NUM_PROVIDERS = 3;
const NUM_CUSTOMERS_PER_PROVIDER = 15;
const NUM_TICKETS_PER_PROVIDER = 50;
const NUM_SERVICE_ORDERS = 30;
const NUM_COMMENTS_PER_TICKET = 3;
const NUM_BRANCHES_PER_PROVIDER_MIN = 1;
const NUM_BRANCHES_PER_PROVIDER_MAX = 3;
const NUM_GROUPS_PER_PROVIDER_MIN = 1;
const NUM_GROUPS_PER_PROVIDER_MAX = 3;
const NUM_SERVICES_PER_PROVIDER_MIN = 3;
const NUM_SERVICES_PER_PROVIDER_MAX = 6;
const NUM_CREDENTIALS_PER_SERVICE_MIN = 1;
const NUM_CREDENTIALS_PER_SERVICE_MAX = 3;

// Status possíveis para tickets
const TICKET_STATUSES = ['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed', 'cancelled'];
const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const TICKET_CATEGORIES = ['hardware', 'software', 'network', 'security', 'access', 'email', 'backup', 'maintenance', 'training', 'other'];
const TICKET_SOURCES = ['manual', 'email', 'portal', 'phone', 'chat', 'api'];

// Status possíveis para ordens de serviço
const SERVICE_ORDER_STATUSES = Object.values($Enums.ServiceOrderStatus);
const SERVICE_ORDER_PRIORITIES = Object.values($Enums.ServiceOrderPriority);
const SERVICE_TYPES = Object.values($Enums.ProviderServiceType);
const CREDENTIAL_VISIBILITIES = Object.values($Enums.CredentialVisibility);

// Funções auxiliares
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  console.log('🚀 Iniciando seed de dados fake...');

  // Criar usuários
  const users = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName, provider: 'fakeprovider.com' }),
        password: await bcrypt.hash('password123', 10),
        role: getRandomItem(['admin', 'manager', 'technician', 'support'])
      }
    });
    users.push(user);
    console.log(`👤 Usuário criado: ${user.name} (${user.email})`);
  }

  // Criar providers
  const providers = [];
  for (let i = 0; i < NUM_PROVIDERS; i++) {
    const companyName = faker.company.name();
    const workspace = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const provider = await prisma.provider.create({
      data: {
        name: companyName,
        cnpj: faker.string.numeric(14),
        workspace: workspace,
        ownerId: users[i].id,
        phone: faker.phone.number(),
        email: faker.internet.email({ provider: workspace + '.com' })
      }
    });
    providers.push(provider);
    console.log(`🏢 Provider criado: ${provider.name} (${provider.workspace})`);
    
    // Associar alguns usuários a este provider
    const providerUsers = getRandomItems(users, getRandomInt(3, 6));
    for (const user of providerUsers) {
      await prisma.providerUser.create({
        data: {
          userId: user.id,
          providerId: provider.id,
          role: getRandomItem(['admin', 'manager', 'technician', 'support', 'viewer']),
          permissions: getRandomItems(['read:tickets', 'write:tickets', 'read:customers', 'write:customers', 'read:equipment', 'write:equipment'], getRandomInt(2, 5))
        }
      });
    }

    // Criar filiais
    const numBranches = getRandomInt(NUM_BRANCHES_PER_PROVIDER_MIN, NUM_BRANCHES_PER_PROVIDER_MAX);
    for (let b = 0; b < numBranches; b++) {
      await prisma.providerBranch.create({
        data: {
          name: `${companyName} - ${faker.location.city()}`,
          phone: faker.phone.number(),
          email: faker.internet.email({ provider: workspace + '.com' }),
          address: {
            street: faker.location.street(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipcode: faker.location.zipCode()
          },
          notes: Math.random() > 0.5 ? faker.lorem.sentence() : null,
          providerId: provider.id
        }
      });
    }
    console.log(`🏬 ${numBranches} filiais criadas para ${provider.name}`);

    // Criar grupos
    const groups = [];
    const numGroups = getRandomInt(NUM_GROUPS_PER_PROVIDER_MIN, NUM_GROUPS_PER_PROVIDER_MAX);
    for (let g = 0; g < numGroups; g++) {
      const group = await prisma.providerGroup.create({
        data: {
          name: `Grupo ${g + 1} - ${workspace}`,
          description: Math.random() > 0.5 ? faker.lorem.sentence() : null,
          providerId: provider.id
        }
      });
      groups.push(group);
    }
    console.log(`👥 ${numGroups} grupos criados para ${provider.name}`);

    // Associar membros aos grupos
    const providerUsersList = await prisma.providerUser.findMany({ where: { providerId: provider.id } });
    for (const group of groups) {
      const members = getRandomItems(providerUsersList, getRandomInt(2, Math.max(2, providerUsersList.length)));
      for (const m of members) {
        await prisma.providerGroupMember.create({
          data: {
            groupId: group.id,
            providerUserId: m.id
          }
        });
      }
    }
    console.log(`👤 Membros associados aos grupos de ${provider.name}`);

    // Criar serviços
    const numServices = getRandomInt(NUM_SERVICES_PER_PROVIDER_MIN, NUM_SERVICES_PER_PROVIDER_MAX);
    const services = [];
    for (let s = 0; s < numServices; s++) {
      const type = getRandomItem(SERVICE_TYPES);
      const nameByType = {
        zabbix: 'Zabbix',
        proxmox: 'Proxmox',
        grafana: 'Grafana',
        erp: 'ERP',
        other: faker.company.catchPhrase()
      };
      const name = nameByType[type] || faker.company.catchPhrase();
      const service = await prisma.providerService.create({
        data: {
          name,
          type,
          url: `https://${String(type)}.${workspace}.com`,
          description: Math.random() > 0.5 ? faker.lorem.sentence() : null,
          isActive: Math.random() > 0.2,
          providerId: provider.id
        }
      });
      services.push(service);
    }
    console.log(`🧩 ${numServices} serviços criados para ${provider.name}`);

    // Criar credenciais por serviço
    for (const service of services) {
      const numCreds = getRandomInt(NUM_CREDENTIALS_PER_SERVICE_MIN, NUM_CREDENTIALS_PER_SERVICE_MAX);
      for (let c = 0; c < numCreds; c++) {
        const visibility = getRandomItem(CREDENTIAL_VISIBILITIES);
        const username = faker.internet.userName();
        const plainPassword = faker.internet.password({ length: 12 });
        const passwordEnc = encryptCredential(plainPassword);
        const credential = await prisma.providerServiceCredential.create({
          data: {
            serviceId: service.id,
            label: `Acesso ${c + 1}`,
            username,
            passwordEnc,
            isActive: Math.random() > 0.1,
            visibility
          }
        });

        if (visibility === 'CUSTOM') {
          const allowedUsers = getRandomItems(providerUsersList, Math.min(getRandomInt(1, 3), providerUsersList.length));
          const allowedGroups = getRandomItems(groups, Math.min(getRandomInt(1, 2), groups.length));
          for (const u of allowedUsers) {
            await prisma.credentialUserAccess.create({
              data: {
                credentialId: credential.id,
                providerUserId: u.id
              }
            });
          }
          for (const g of allowedGroups) {
            await prisma.credentialGroupAccess.create({
              data: {
                credentialId: credential.id,
                groupId: g.id
              }
            });
          }
        }
      }
    }
    console.log(`🔑 Credenciais criadas e vinculadas aos serviços de ${provider.name}`);
  }

  // Criar clientes para cada provider
  const customers = [];
  for (const provider of providers) {
    for (let i = 0; i < NUM_CUSTOMERS_PER_PROVIDER; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const customer = await prisma.customer.create({
        data: {
          name: `${firstName} ${lastName}`,
          email: faker.internet.email({ firstName, lastName, provider: `cliente${i}.${provider.workspace}.com` }),
          password: await bcrypt.hash('customer123', 10),
          providerId: provider.id,
          phone: faker.phone.number(),
          document: faker.string.numeric(11),
          address: Math.random() > 0.3 ? { 
            street: faker.location.street(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipcode: faker.location.zipCode()
          } : null,
          isActive: Math.random() > 0.1
        }
      });
      customers.push(customer);
    }
    console.log(`🧑‍💼 ${NUM_CUSTOMERS_PER_PROVIDER} clientes criados para ${provider.name}`);
  }

  // Criar equipamentos para cada provider
  const equipmentTypes = Object.values($Enums.EquipmentType);
  const equipmentStatuses = Object.values($Enums.EquipmentStatus);
  
  for (const provider of providers) {
    const numEquipments = getRandomInt(5, 15);
    for (let i = 0; i < numEquipments; i++) {
      const type = getRandomItem(equipmentTypes);
      await prisma.equipment.create({
        data: {
          label: `${faker.commerce.productName()} ${type}`,
          type: type,
          serial: `${type.substring(0, 2).toUpperCase()}-${faker.string.alphanumeric(8).toUpperCase()}`,
          status: getRandomItem(equipmentStatuses),
          providerId: provider.id
        }
      });
    }
    console.log(`⚙️ ${numEquipments} equipamentos criados para ${provider.name}`);
  }

  // Criar tickets para cada provider
  const tickets = [];
  for (const provider of providers) {
    const providerCustomers = customers.filter(c => c.providerId === provider.id);
    
    for (let i = 0; i < NUM_TICKETS_PER_PROVIDER; i++) {
      const customer = getRandomItem(providerCustomers);
      const status = getRandomItem(TICKET_STATUSES);
      const createdAt = getRandomDate(new Date(2023, 0, 1), new Date());
      
      const ticket = await prisma.ticket.create({
        data: {
          title: faker.lorem.sentence({ min: 3, max: 8 }),
          description: faker.lorem.paragraphs({ min: 1, max: 3 }),
          status: status,
          priority: getRandomItem(TICKET_PRIORITIES),
          source: getRandomItem(TICKET_SOURCES),
          providerId: provider.id,
          createdAt: createdAt,
          updatedAt: getRandomDate(createdAt, new Date())
        }
      });
      tickets.push(ticket);
      
      // Adicionar comentários ao ticket
      const numComments = getRandomInt(0, NUM_COMMENTS_PER_TICKET);
      for (let j = 0; j < numComments; j++) {
        const isInternal = Math.random() > 0.7;
        const commentDate = getRandomDate(createdAt, new Date());
        
        await prisma.comment.create({
          data: {
            content: faker.lorem.paragraph(),
            resourceType: 'ticket',
            resourceId: ticket.id,
            isInternal: isInternal,
            userId: isInternal ? getRandomItem(users).id : null,
            providerId: provider.id,
            ticketId: ticket.id,
            customerId: isInternal ? null : customer.id,
            createdAt: commentDate,
            updatedAt: commentDate
          }
        });
      }
    }
    console.log(`🎫 ${NUM_TICKETS_PER_PROVIDER} tickets criados para ${provider.name}`);
  }

  // Criar ordens de serviço
  const ticketsForServiceOrders = getRandomItems(tickets, NUM_SERVICE_ORDERS);
  for (const ticket of ticketsForServiceOrders) {
    const createdAt = new Date(ticket.createdAt);
    const scheduledDate = getRandomDate(createdAt, new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000));
    const status = getRandomItem(SERVICE_ORDER_STATUSES);
    
    let startedAt = null;
    let completedAt = null;
    
    if (status !== 'pending') {
      startedAt = getRandomDate(scheduledDate, new Date());
      if (['completed', 'cancelled'].includes(status)) {
        completedAt = getRandomDate(startedAt, new Date());
      }
    }
    
    const estimatedHours = getRandomInt(1, 8);
    const actualHours = completedAt ? getRandomInt(Math.max(1, estimatedHours - 2), estimatedHours + 2) : null;
    
    await prisma.serviceOrder.create({
      data: {
        title: `OS: ${ticket.title}`,
        description: faker.lorem.paragraph(),
        status: status,
        priority: getRandomItem(SERVICE_ORDER_PRIORITIES),
        scheduledDate: scheduledDate,
        startedAt: startedAt,
        completedAt: completedAt,
        estimatedHours: estimatedHours,
        actualHours: actualHours,
        cost: actualHours ? actualHours * getRandomInt(50, 150) : null,
        notes: Math.random() > 0.5 ? faker.lorem.paragraph() : null,
        providerId: ticket.providerId,
        ticketId: ticket.id
      }
    });
  }
  console.log(`🔧 ${NUM_SERVICE_ORDERS} ordens de serviço criadas`);

  console.log('✅ Seed de dados fake concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Seed falhou:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
const ENC_KEY_BASE64 = process.env.CREDENTIALS_ENCRYPTION_KEY || '';
if (!ENC_KEY_BASE64) {
  console.error('❌ Variável de ambiente CREDENTIALS_ENCRYPTION_KEY ausente. Configure uma chave base64 de 32 bytes antes de executar o seed.');
  process.exit(1);
}
const ENC_KEY = Buffer.from(ENC_KEY_BASE64, 'base64');

function encryptCredential(password) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENC_KEY, iv);
  const enc = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}