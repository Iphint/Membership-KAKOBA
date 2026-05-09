const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function seedRewardTier() {
  await prisma.rewardTier.createMany({
    data: [
      { reward_name: "Silver", point_needed: 100 },
      { reward_name: "Gold", point_needed: 500 },
      { reward_name: "Platinum", point_needed: 1000 },
    ],
    skipDuplicates: true,
  });

  console.log("✅ RewardTier seeded");
}

async function seedRewards() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    await prisma.reward.create({
      data: {
        user_id: user.id,
        point_transaction: faker.number.int({ min: 50, max: 500 }),
        reward_name: faker.helpers.arrayElement(["Voucher", "Diskon", "Gift"]),
      },
    });
  }

  console.log("✅ Rewards seeded");
}

module.exports = { seedRewardTier, seedRewards };
