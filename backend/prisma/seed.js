const { PrismaClient, $Enums } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔰 Seed iniciado...');

  // Usuário admin para ser owner do provider
  const user = await prisma.user.upsert({
    where: { email: 'seed@demo.local' },
    update: {},
    create: {
      name: 'Seed User',
      email: 'seed@demo.local',
      password: 'seedpass', // apenas para ambiente de desenvolvimento
      role: 'admin'
    }
  });
  console.log('👤 Usuário:', user.email, 'id=', user.id);

  // Provider principal para testes
  const provider = await prisma.provider.upsert({
    where: { workspace: 'seed-provider' },
    update: {},
    create: {
      name: 'Seed Provider',
      cnpj: '00.000.000/0000-00',
      workspace: 'seed-provider',
      ownerId: user.id
    }
  });
  console.log('🏢 Provider:', provider.name, 'id=', provider.id);

  const equipments = [
    { label: 'Core Switch', type: $Enums.EquipmentType.switch, serial: 'SW-001', status: $Enums.EquipmentStatus.active },
    { label: 'OLT Central', type: $Enums.EquipmentType.olt, serial: 'OLT-001', status: $Enums.EquipmentStatus.maintenance },
    { label: 'Router Edge', type: $Enums.EquipmentType.router, serial: 'RT-001', status: $Enums.EquipmentStatus.inactive },
    { label: 'App Server', type: $Enums.EquipmentType.server, serial: 'SV-001', status: $Enums.EquipmentStatus.active },
    { label: 'VM Host', type: $Enums.EquipmentType.virtualizer, serial: 'VH-001', status: $Enums.EquipmentStatus.active },
    { label: 'Firewall', type: $Enums.EquipmentType.other, serial: 'FW-001', status: $Enums.EquipmentStatus.active }
  ];

  for (const e of equipments) {
    const created = await prisma.equipment.upsert({
      where: { serial: e.serial },
      update: {
        label: e.label,
        type: e.type,
        status: e.status,
        providerId: provider.id,
        updatedAt: new Date()
      },
      create: {
        providerId: provider.id,
        label: e.label,
        type: e.type,
        serial: e.serial,
        status: e.status
      }
    });
    console.log(`⚙️  Equipment upsert: ${created.label} (${created.type}) serial=${created.serial}`);
  }

  console.log('✅ Seed concluído com sucesso.');
}

main()
  .catch((e) => {
    console.error('❌ Seed falhou:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });