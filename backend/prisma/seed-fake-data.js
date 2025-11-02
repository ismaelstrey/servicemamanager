const { PrismaClient, $Enums } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker/locale/pt_BR');

const prisma = new PrismaClient();

// Configurações
const NUM_USERS = 10;
const NUM_PROVIDERS = 3;
const NUM_CUSTOMERS_PER_PROVIDER = 15;
const NUM_TICKETS_PER_PROVIDER = 50;
const NUM_SERVICE_ORDERS = 30;
const NUM_COMMENTS_PER_TICKET = 3;

// Status possíveis para tickets
const TICKET_STATUSES = ['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed', 'cancelled'];
const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const TICKET_CATEGORIES = ['hardware', 'software', 'network', 'security', 'access', 'email', 'backup', 'maintenance', 'training', 'other'];
const TICKET_SOURCES = ['manual', 'email', 'portal', 'phone', 'chat', 'api'];

// Status possíveis para ordens de serviço
const SERVICE_ORDER_STATUSES = Object.values($Enums.ServiceOrderStatus);
const SERVICE_ORDER_PRIORITIES = Object.values($Enums.ServiceOrderPriority);

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
        ownerId: users[i].id
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