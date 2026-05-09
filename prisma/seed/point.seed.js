const { PrismaClient } = require('@prisma/client')
const { faker } = require('@faker-js/faker')

const prisma = new PrismaClient()

async function seedPoints() {
  const users = await prisma.user.findMany()

  const data = users.map(user => ({
    user_id: user.id,
    point_balance: faker.number.int({ min: 0, max: 1000 })
  }))

  await prisma.point.createMany({
    data,
    skipDuplicates: true
  })

  console.log("✅ Points seeded")
}

module.exports = { seedPoints }