const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedUsers(total = 50) {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = Array.from({ length: total }).map((_, i) => ({
    email: `user${i}_${faker.internet.email().toLowerCase()}`,
    username: `user_${i}_${faker.internet.username()}`,
    password: hashedPassword,
    no_telp: faker.phone.number("08##########"),
    roles: ["USER"],
  }));

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`✅ ${total} users created`);
}

async function seedAdmin() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@mail.com" },
    update: {},
    create: {
      email: "admin@mail.com",
      username: "admin",
      password: hashedPassword,
      roles: ["ADMIN"],
    },
  });

  console.log("✅ admin created");
}

module.exports = {
  seedUsers,
  seedAdmin,
};
