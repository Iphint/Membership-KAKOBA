const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function seedTransactions() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    const count = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < count; i++) {
      await prisma.transaction.create({
        data: {
          user_id: user.id,
          point_transaction: faker.number.int({ min: 10, max: 100 }),
          type: faker.helpers.arrayElement(["BUY", "REDEEM"]),
          qr_code_token: faker.string.uuid(),
          qr_code_used: faker.datatype.boolean(),

          items: {
            create: Array.from({ length: 2 }).map(() => ({
              name_product_transaction: faker.commerce.productName(),
              price_product_transaction: faker.number.int({
                min: 10000,
                max: 100000,
              }),
              quantity_product_transaction: faker.number.int({
                min: 1,
                max: 3,
              }),
            })),
          },
        },
      });
    }
  }

  console.log("✅ Transactions seeded");
}

module.exports = { seedTransactions };
