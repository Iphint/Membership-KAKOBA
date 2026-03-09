beforeEach(async () => {
    await prisma.transactionItem.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.productPromo.deleteMany();
    await prisma.point.deleteMany();
    await prisma.user.deleteMany();
  
    // Create users
    const userA = await prisma.user.create({ data: { name: "User A" } });
    const userB = await prisma.user.create({ data: { name: "User B" } });
  
    // Create point
    await prisma.point.createMany({
      data: [
        { user_id: userA.id, point_balance: 100 },
        { user_id: userB.id, point_balance: 100 },
      ],
    });
  
    // Create product with stock 1
    await prisma.productPromo.create({
      data: {
        id: 1,
        product_name: "Promo A",
        stock: 1,
        price: 30,
      },
    });
  
    global.userA = userA;
    global.userB = userB;
  });
  