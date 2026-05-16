const { PrismaClient } = require("@prisma/client");
const redisClient = require("../config/Redis");
const prisma = new PrismaClient();
const { v4: uuidv4 } = require("uuid");

const invalidateTransactionCache = async () => {
  const keys = await redisClient.keys("all_transactions_with_users*");
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

const TransactionModel = {
  createTransaction: async (
    user_id,
    items,
    point_transaction,
    type = "earn"
  ) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            user_id: parseInt(user_id),
            point_transaction,
            type,
            items: {
              create: items.map((item) => ({
                name_product_transaction: item.name_product_transaction,
                price_product_transaction: item.price_product_transaction,
                quantity_product_transaction: item.quantity_product_transaction,
              })),
            },
          },
          include: {
            items: true,
          },
        });
        const existingPoint = await tx.point.findFirst({
          where: { user_id: parseInt(user_id) },
        });

        if (existingPoint) {
          await tx.point.update({
            where: { id: existingPoint.id },
            data: {
              point_balance: {
                increment: point_transaction,
              },
            },
          });
        } else {
          await tx.point.create({
            data: {
              user_id: parseInt(user_id),
              point_balance: point_transaction,
            },
          });
        }

        return transaction;
      });

      await invalidateTransactionCache();
      console.log("Cache transaksi dihapus setelah transaksi baru dibuat.");

      return result;
    } catch (error) {
      console.error("Error creating transaction and adding points:", error);
      throw error;
    }
  },
  createRedeemTransaction: async (
    user_id,
    items,
    point_transaction,
    type = "redeem"
  ) => {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          for (const item of items) {
            const stockResult = await tx.productPromo.updateMany({
              where: {
                id: parseInt(item.product_id),
                stock: {
                  gte: item.quantity_product_transaction,
                },
              },
              data: {
                stock: {
                  decrement: item.quantity_product_transaction,
                },
              },
            });

            if (stockResult.count === 0) {
              throw new Error("INSUFFICIENT_STOCK");
            }
          }
          const pointResult = await tx.point.updateMany({
            where: {
              user_id: parseInt(user_id),
              point_balance: {
                gte: point_transaction,
              },
            },
            data: {
              point_balance: {
                decrement: point_transaction,
              },
            },
          });

          if (pointResult.count === 0) {
            throw new Error("INSUFFICIENT_POINTS");
          }
          const qrToken = uuidv4();
          const transaction = await tx.transaction.create({
            data: {
              user_id: parseInt(user_id),
              point_transaction,
              type,
              qr_code_token: qrToken,
              qr_code_used: false,
              items: {
                create: items.map((item) => ({
                  name_product_transaction: item.name_product_transaction,
                  price_product_transaction: item.price_product_transaction,
                  quantity_product_transaction:
                    item.quantity_product_transaction,
                })),
              },
            },
            include: { items: true },
          });

          return transaction;
        },
        {
          isolationLevel: "Serializable",
        }
      );

      await invalidateTransactionCache();
      console.log("Cache invalidated after redeem transaction.");
      return result;
    } catch (error) {
      console.error("Error creating redeem transaction:", error);
      throw error;
    }
  },
  updateTransactionQRCode: async (id, qr_code_token) => {
    try {
      const updatedTransaction = await prisma.transaction.updateMany({
        where: {
          id: parseInt(id),
          qr_code_token: qr_code_token,
          qr_code_used: false,
        },
        data: {
          qr_code_used: true,
        },
      });
      return updatedTransaction;
    } catch (error) {
      console.error("Error updating transaction QR code:", error);
      throw error;
    }
  },
  getAllTransactions: async ({ skip, limit, page } = {}) => {
    const cacheKey = `all_transactions_with_users:${page || "all"}:${
      limit || "all"
    }`;
    const CACHE_EXPIRATION_TIME = 60 * 2;
    try {
      const canchedTransactions = await redisClient.get(cacheKey);
      if (canchedTransactions) {
        console.log("Mengambil semua transaksi dari cache Redis.");
        return JSON.parse(canchedTransactions);
      }
      const findArgs = {
        include: {
          user: true,
          items: true,
        },
        orderBy: { createdAt: "desc" },
      };

      if (Number.isInteger(skip) && Number.isInteger(limit)) {
        findArgs.skip = skip;
        findArgs.take = limit;
      }

      const [transactions, totalItems] = await prisma.$transaction([
        prisma.transaction.findMany(findArgs),
        prisma.transaction.count(),
      ]);

      const result = { data: transactions, totalItems };

      await redisClient.setex(
        cacheKey,
        CACHE_EXPIRATION_TIME,
        JSON.stringify(result)
      );
      console.log(
        `Semua transaksi disimpan ke Redis dengan masa berlaku ${CACHE_EXPIRATION_TIME} detik.`
      );
      console.log("Mengambil semua transaksi dari database.");
      return result;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },
  getTransactionById: async (id) => {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: true,
          items: true,
        },
      });
      return transaction;
    } catch (error) {
      console.error("Error fetching transaction by ID:", error);
      throw error;
    }
  },
  getTransactionsByUserId: async (user_id, { skip, limit } = {}) => {
    try {
      const where = { user_id: parseInt(user_id) };
      const findArgs = {
        where,
        include: {
          user: true,
          items: true,
        },
        orderBy: { createdAt: "desc" },
      };

      if (Number.isInteger(skip) && Number.isInteger(limit)) {
        findArgs.skip = skip;
        findArgs.take = limit;
      }

      const [transactions, totalItems] = await prisma.$transaction([
        prisma.transaction.findMany(findArgs),
        prisma.transaction.count({
          where,
        }),
      ]);

      return { data: transactions, totalItems };
    } catch (error) {
      console.error("Error fetching transactions by user ID:", error);
      throw error;
    }
  },
  updateTransaction: async (id, data) => {
    try {
      const updatedTransaction = await prisma.transaction.update({
        where: { id: parseInt(id) },
        data,
      });
      await invalidateTransactionCache();
      console.log("Cache transaksi dihapus setelah transaksi updated dibuat.");
      return updatedTransaction;
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  },
  deleteTransaction: async (id) => {
    try {
      const deletedTransaction = await prisma.transaction.delete({
        where: { id: parseInt(id) },
        include: { items: true },
      });
      await invalidateTransactionCache();
      console.log(
        "Cache transaksi dihapus setelah transaksi single delete dibuat."
      );
      return deletedTransaction;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  },
  deleteAllTransactions: async () => {
    try {
      const deletedTransactions = await prisma.transaction.deleteMany();
      await invalidateTransactionCache();
      console.log(
        "Cache transaksi dihapus setelah transaksi delete all dibuat."
      );
      return deletedTransactions;
    } catch (error) {
      console.error("Error deleting all transactions:", error);
      throw error;
    }
  },
  getUserById: async (user_id) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(user_id) },
      });
      return user;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  },
};

module.exports = TransactionModel;
