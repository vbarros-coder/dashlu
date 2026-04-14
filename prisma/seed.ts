import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Iniciando seed...");

  // Criar usuários autorizados
  const users = [
    {
      email: "wfernandez@addvaloraglobal.com",
      name: "W. Fernandez",
      role: "admin",
    },
    {
      email: "lhey@addvaloraglobal.com",
      name: "L. Hey",
      role: "admin",
    },
  ];

  for (const userData of users) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existing) {
      await prisma.user.create({
        data: userData,
      });
      console.log(`✅ Usuário criado: ${userData.email}`);
    } else {
      console.log(`⚡ Usuário já existe: ${userData.email}`);
    }
  }

  // Configurações padrão
  const configs = [
    { key: "SESSION_SECRET", value: process.env.SESSION_SECRET || "nie-dashboard-secret" },
    { key: "MAX_LOGIN_ATTEMPTS", value: "5" },
    { key: "BLOCK_DURATION_MINUTES", value: "15" },
    { key: "SESSION_DURATION_HOURS", value: "8" },
  ];

  for (const config of configs) {
    await prisma.config.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }

  console.log("✅ Seed completo!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
