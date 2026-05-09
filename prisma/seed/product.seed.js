const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function seedProducts() {
  for (let i = 0; i < 10; i++) {
    const start = faker.date.past();
    const end = faker.date.future();

    await prisma.productPromo.create({
      data: {
        product_name: faker.commerce.productName(),
        price_normal: faker.number.int({ min: 20000, max: 200000 }),
        discount: faker.number.int({ min: 0, max: 50 }),
        product_description: faker.commerce.productDescription(),
        product_category: faker.commerce.department(),
        product_point: faker.number.int({ min: 10, max: 200 }),
        start_date: start,
        end_date: end,
        stock: faker.number.int({ min: 0, max: 100 }),

        ImagePromo: {
          create: [
            { image_url: faker.image.urlLoremFlickr({ category: "product" }) },
          ],
        },
      },
    });
  }

  console.log("✅ Products seeded");
}

module.exports = { seedProducts };
