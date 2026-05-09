const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { seedUsers, seedAdmin } = require("./seed/user.seed");
const { seedPoints } = require("./seed/point.seed");
const { seedRewardTier, seedRewards } = require("./seed/reward.seed");
const { seedTransactions } = require("./seed/transaction.seed");
const { seedProducts } = require("./seed/product.seed");
const { seedEvents } = require("./seed/event.seed");

async function main() {
  await seedAdmin();
  await seedUsers(50);

  await seedRewardTier();
  await seedPoints();

  await seedProducts();
  await seedEvents();

  await seedTransactions();
  await seedRewards();
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
