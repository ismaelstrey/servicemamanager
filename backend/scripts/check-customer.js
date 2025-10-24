const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const c = await prisma.customer.findUnique({ where: { email: 'client@demo.local' } });
    console.log(JSON.stringify(c, null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
})();