const { PrismaClient, $Enums } = require('@prisma/client');
require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
      ownerId: user.id,
      phone: '11988887777',
      email: 'contato@seed-provider.local'
    }
  });
  console.log('🏢 Provider:', provider.name, 'id=', provider.id);

  const branch = await prisma.providerBranch.create({
    data: {
      name: 'Matriz Seed',
      phone: '11977776666',
      email: 'matriz@seed-provider.local',
      address: { street: 'Rua Seed', city: 'São Paulo', state: 'SP', zipcode: '01000-000' },
      providerId: provider.id
    }
  });
  console.log('🏬 Branch criada:', branch.name, 'id=', branch.id);

  const encKeyBase64 = process.env.CREDENTIALS_ENCRYPTION_KEY;
  if (!encKeyBase64) throw new Error('CREDENTIALS_ENCRYPTION_KEY ausente no ambiente');
  const encKey = Buffer.from(encKeyBase64, 'base64');
  const encryptCredential = (password) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', encKey, iv);
    const enc = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, enc]).toString('base64');
  };

  const service = await prisma.providerService.create({
    data: {
      name: 'Zabbix',
      type: $Enums.ProviderServiceType.zabbix,
      url: 'https://zabbix.seed-provider.local',
      description: 'Monitoramento',
      isActive: true,
      providerId: provider.id
    }
  });
  console.log('🧩 Serviço criado:', service.name, 'id=', service.id);

  const credential = await prisma.providerServiceCredential.create({
    data: {
      serviceId: service.id,
      label: 'Acesso Principal',
      username: 'seeduser',
      passwordEnc: encryptCredential('SeedPass123!'),
      isActive: true,
      visibility: $Enums.CredentialVisibility.PROVIDER_ONLY
    }
  });
  console.log('🔑 Credencial criada:', credential.label, 'id=', credential.id);

  // Cliente de exemplo vinculado ao provider
  const clientPasswordHash = await bcrypt.hash('clientpass', 10);
  const customer = await prisma.customer.upsert({
    where: { email: 'client@demo.local' },
    update: {},
    create: {
      name: 'Cliente Demo',
      email: 'client@demo.local',
      password: clientPasswordHash,
      providerId: provider.id,
      phone: '11999999999',
      document: '000.000.000-00',
      isActive: true
    }
  });
  console.log('🧑‍💼 Cliente:', customer.email, 'id=', customer.id);

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

  // ===== COMUNICAÇÃO: Channels e IntegrationAccounts =====
  console.log('📡 Criando canais de comunicação e contas de integração...');

  const whatsappChannel = await prisma.channel.upsert({
    where: { id: 1 },
    update: { type: $Enums.ChannelType.whatsapp, name: 'WhatsApp', isActive: true },
    create: { type: $Enums.ChannelType.whatsapp, name: 'WhatsApp', description: 'Canal WhatsApp', isActive: true }
  });

  const telegramChannel = await prisma.channel.upsert({
    where: { id: 2 },
    update: { type: $Enums.ChannelType.telegram, name: 'Telegram', isActive: true },
    create: { type: $Enums.ChannelType.telegram, name: 'Telegram', description: 'Canal Telegram', isActive: true }
  });

  const evolutionAccount = await prisma.integrationAccount.upsert({
    where: { id: 1 },
    update: {
      channelId: whatsappChannel.id,
      baseUrl: process.env.EVOLUTION_BASE_URL || 'https://evolution.example.local',
      token: process.env.EVOLUTION_SESSION_TOKEN || null,
      isActive: true
    },
    create: {
      channelId: whatsappChannel.id,
      baseUrl: process.env.EVOLUTION_BASE_URL || 'https://evolution.example.local',
      token: process.env.EVOLUTION_SESSION_TOKEN || null,
      sessionId: 'seed-session',
      isActive: true,
      metadata: { provider: 'evolution' }
    }
  });

  const watiicketAccount = await prisma.integrationAccount.upsert({
    where: { id: 2 },
    update: {
      channelId: whatsappChannel.id,
      baseUrl: process.env.WATIICKET_BASE_URL || 'https://watiicket.example.local',
      token: process.env.WATIICKET_API_KEY || null,
      isActive: true
    },
    create: {
      channelId: whatsappChannel.id,
      baseUrl: process.env.WATIICKET_BASE_URL || 'https://watiicket.example.local',
      token: process.env.WATIICKET_API_KEY || null,
      isActive: true,
      metadata: { provider: 'watiicket' }
    }
  });

  const telegramAccount = await prisma.integrationAccount.upsert({
    where: { id: 3 },
    update: {
      channelId: telegramChannel.id,
      baseUrl: 'https://api.telegram.org',
      token: process.env.TELEGRAM_BOT_TOKEN || null,
      isActive: true
    },
    create: {
      channelId: telegramChannel.id,
      baseUrl: 'https://api.telegram.org',
      token: process.env.TELEGRAM_BOT_TOKEN || null,
      isActive: true,
      metadata: { provider: 'telegram' }
    }
  });

  console.log('✅ Channels criados:', { whatsappChannel: whatsappChannel.id, telegramChannel: telegramChannel.id });
  console.log('✅ IntegrationAccounts criadas:', { evolutionAccount: evolutionAccount.id, watiicketAccount: watiicketAccount.id, telegramAccount: telegramAccount.id });

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