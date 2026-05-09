const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function seedEvents() {
  for (let i = 0; i < 5; i++) {
    await prisma.events.create({
      data: {
        event_name: faker.company.name(),
        event_date: faker.date.future(),
        location: faker.location.city(),
        description: faker.lorem.paragraph(),

        ImageEvent: {
          create: [
            { image_url: faker.image.urlLoremFlickr({ category: "event" }) },
          ],
        },
      },
    });
  }

  console.log("✅ Events seeded");
}

module.exports = { seedEvents };
