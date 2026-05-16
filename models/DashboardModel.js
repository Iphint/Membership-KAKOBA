const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const startOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const addMonths = (date, amount) => {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
};

const monthKey = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
};

const getTransactionValue = (transaction) => {
  return transaction.items.reduce((sum, item) => {
    return (
      sum +
      item.price_product_transaction * item.quantity_product_transaction
    );
  }, 0);
};

const isRedeemTransaction = (transaction) => transaction.type === "redeem";

const isEarnTransaction = (transaction) => !isRedeemTransaction(transaction);

const getTrendPercentage = (currentValue, previousValue) => {
  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return Math.round(((currentValue - previousValue) / previousValue) * 100);
};

const buildMonthlyBuckets = () => {
  const currentMonth = startOfMonth(new Date());
  const firstMonth = addMonths(currentMonth, -5);
  const buckets = [];

  for (let index = 0; index < 6; index += 1) {
    const date = addMonths(firstMonth, index);
    buckets.push({
      key: monthKey(date),
      month: MONTH_LABELS[date.getMonth()],
      earn: 0,
      redeem: 0,
      users: 0,
    });
  }

  return buckets;
};

const DashboardModel = {
  getSummary: async () => {
    try {
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const previousMonthStart = addMonths(currentMonthStart, -1);
      const nextMonthStart = addMonths(currentMonthStart, 1);
      const chartMonthStart = addMonths(currentMonthStart, -5);

      const [
        totalUsers,
        currentMonthUsers,
        previousMonthUsers,
        products,
        points,
        transactions,
        chartUsers,
        activeEvents,
        upcomingEvents,
      ] = await prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({
          where: {
            createdAt: {
              gte: currentMonthStart,
              lt: nextMonthStart,
            },
          },
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: previousMonthStart,
              lt: currentMonthStart,
            },
          },
        }),
        prisma.productPromo.findMany({
          select: {
            id: true,
            product_category: true,
            is_available: true,
            createdAt: true,
          },
        }),
        prisma.point.findMany({
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: {
            point_balance: "desc",
          },
        }),
        prisma.transaction.findMany({
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            items: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.user.findMany({
          where: {
            createdAt: {
              gte: chartMonthStart,
            },
          },
          select: {
            createdAt: true,
          },
        }),
        prisma.events.count({
          where: {
            event_date: {
              gte: now,
            },
          },
        }),
        prisma.events.findMany({
          where: {
            event_date: {
              gte: now,
            },
          },
          include: {
            ImageEvent: true,
          },
          orderBy: {
            event_date: "asc",
          },
          take: 3,
        }),
      ]);

      const activeProducts = products.filter(
        (product) => product.is_available
      ).length;
      const totalPoints = points.reduce(
        (sum, point) => sum + point.point_balance,
        0
      );

      let totalRevenue = 0;
      let currentMonthRevenue = 0;
      let previousMonthRevenue = 0;
      let currentMonthProducts = 0;
      let previousMonthProducts = 0;
      let currentMonthPoints = 0;
      let previousMonthPoints = 0;

      products.forEach((product) => {
        if (product.createdAt >= currentMonthStart && product.createdAt < nextMonthStart) {
          currentMonthProducts += 1;
        }

        if (
          product.createdAt >= previousMonthStart &&
          product.createdAt < currentMonthStart
        ) {
          previousMonthProducts += 1;
        }
      });

      transactions.forEach((transaction) => {
        const value = getTransactionValue(transaction);

        if (isEarnTransaction(transaction)) {
          totalRevenue += value;

          if (
            transaction.createdAt >= currentMonthStart &&
            transaction.createdAt < nextMonthStart
          ) {
            currentMonthRevenue += value;
          }

          if (
            transaction.createdAt >= previousMonthStart &&
            transaction.createdAt < currentMonthStart
          ) {
            previousMonthRevenue += value;
          }
        }

        if (
          transaction.createdAt >= currentMonthStart &&
          transaction.createdAt < nextMonthStart
        ) {
          currentMonthPoints += isRedeemTransaction(transaction)
            ? -transaction.point_transaction
            : transaction.point_transaction;
        }

        if (
          transaction.createdAt >= previousMonthStart &&
          transaction.createdAt < currentMonthStart
        ) {
          previousMonthPoints += isRedeemTransaction(transaction)
            ? -transaction.point_transaction
            : transaction.point_transaction;
        }
      });

      const monthlyBuckets = buildMonthlyBuckets();
      const monthlyMap = new Map(
        monthlyBuckets.map((bucket) => [bucket.key, bucket])
      );

      transactions.forEach((transaction) => {
        const bucket = monthlyMap.get(monthKey(transaction.createdAt));

        if (!bucket) return;

        const value = getTransactionValue(transaction);

        if (isRedeemTransaction(transaction)) {
          bucket.redeem += value;
        } else {
          bucket.earn += value;
        }
      });

      chartUsers.forEach((user) => {
        const bucket = monthlyMap.get(monthKey(user.createdAt));

        if (bucket) {
          bucket.users += 1;
        }
      });

      const categoryMap = products.reduce((map, product) => {
        const category = product.product_category || "Uncategorized";
        map.set(category, (map.get(category) || 0) + 1);
        return map;
      }, new Map());

      const purchaseOrders = transactions.filter(
        (transaction) => isEarnTransaction(transaction)
      ).length;
      const redeemOrders = transactions.filter(
        (transaction) => isRedeemTransaction(transaction)
      ).length;

      return {
        stats: {
          totalUsers,
          totalRevenue,
          activeProducts,
          totalProducts: products.length,
          totalPoints,
          totalTransactions: transactions.length,
          purchaseOrders,
          redeemOrders,
          activeEvents,
        },
        trends: {
          users: getTrendPercentage(currentMonthUsers, previousMonthUsers),
          revenue: getTrendPercentage(
            currentMonthRevenue,
            previousMonthRevenue
          ),
          products: getTrendPercentage(
            currentMonthProducts,
            previousMonthProducts
          ),
          points: getTrendPercentage(currentMonthPoints, previousMonthPoints),
        },
        charts: {
          transactions: monthlyBuckets.map((bucket) => ({
            month: bucket.month,
            earn: bucket.earn,
            redeem: bucket.redeem,
          })),
          userGrowth: monthlyBuckets.map((bucket) => ({
            month: bucket.month,
            users: bucket.users,
          })),
          categories: Array.from(categoryMap.entries()).map(
            ([name, value]) => ({
              name,
              value,
            })
          ),
        },
        topPoints: points.slice(0, 5).map((point) => ({
          id: point.id,
          user_id: point.user_id,
          name: point.user?.username || "Unknown",
          email: point.user?.email,
          points: point.point_balance,
        })),
        recentTransactions: transactions.slice(0, 5).map((transaction) => {
          const firstItem = transaction.items[0];

          return {
            id: transaction.id,
            type: transaction.type,
            point_transaction: transaction.point_transaction,
            created_at: transaction.createdAt,
            username: transaction.user?.username || "Unknown",
            name_product_transaction:
              firstItem?.name_product_transaction || "No item",
            price_product_transaction: firstItem?.price_product_transaction || 0,
            quantity_product_transaction:
              firstItem?.quantity_product_transaction || 0,
            items: transaction.items,
          };
        }),
        upcomingEvents: upcomingEvents.map((event) => ({
          id: event.id,
          event_name: event.event_name,
          event_date: event.event_date,
          location: event.location,
          description: event.description,
          ImageEvent: event.ImageEvent,
        })),
      };
    } catch (error) {
      console.error("Error building dashboard summary:", error);
      throw error;
    }
  },
};

module.exports = DashboardModel;
