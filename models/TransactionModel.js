const { PrismaClient } = require("@prisma/client");
const { get } = require("../routes/TransactionRoutes");
const redisClient = require("../config/Redis");
const prisma = new PrismaClient();
const { v4: uuidv4 } = require("uuid");

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

      const cacheKeyToInvalidate = "all_transactions_with_users";
      await redisClient.del(cacheKeyToInvalidate);
      console.log(
        `Cache "${cacheKeyToInvalidate}" dihapus setelah transaksi baru dibuat.`
      );

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
      const result = await prisma.$transaction(async (tx) => {
        const existingPoint = await tx.point.findFirst({
          where: { user_id: parseInt(user_id) },
        });
        if (!existingPoint || existingPoint.point_balance < point_transaction) {
          throw new Error("Insufficient points to redeem.");
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
                quantity_product_transaction: item.quantity_product_transaction,
              })),
            },
          },
          include: { items: true },
        });
        for (const item of items) {
          const product = await tx.productPromo.findUnique({
            where: { id: parseInt(item.product_id) },
            select: { id: true, stock: true, product_name: true },
          });

          if (!product) {
            throw new Error(`Product with ID ${item.product_id} not found.`);
          }

          if (product.stock < item.quantity_product_transaction) {
            throw new Error(
              `Not enough stock for product: ${product.product_name}. Available: ${product.stock}`
            );
          }
          await tx.productPromo.update({
            where: { id: product.id },
            data: {
              stock: {
                decrement: item.quantity_product_transaction,
              },
            },
          });
        }
        await tx.point.update({
          where: { id: existingPoint.id },
          data: {
            point_balance: {
              decrement: point_transaction,
            },
          },
        });
        return transaction;
      });
      await redisClient.del("all_transactions_with_users");
      console.log(`Cache invalidated after redeem transaction.`);
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
  getAllTransactions: async () => {
    const cacheKey = "all_transactions_with_users";
    const CACHE_EXPIRATION_TIME = 60 * 2;
    try {
      const canchedTransactions = await redisClient.get(cacheKey);
      if (canchedTransactions) {
        console.log("Mengambil semua transaksi dari cache Redis.");
        return JSON.parse(canchedTransactions);
      }
      const transactions = await prisma.transaction.findMany({
        include: {
          user: true,
          items: true,
        },
      });
      await redisClient.setex(
        cacheKey,
        CACHE_EXPIRATION_TIME,
        JSON.stringify(transactions)
      );
      console.log(
        `Semua transaksi disimpan ke Redis dengan masa berlaku ${CACHE_EXPIRATION_TIME} detik.`
      );
      console.log("Mengambil semua transaksi dari database.");
      return transactions;
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
        },
      });
      return transaction;
    } catch (error) {
      console.error("Error fetching transaction by ID:", error);
      throw error;
    }
  },
  getTransactionsByUserId: async (user_id) => {
    try {
      const transactions = await prisma.transaction.findMany({
        where: { user_id: parseInt(user_id) },
        include: {
          user: true,
          items: true,
        },
      });
      return transactions;
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
      const cacheKeyToInvalidate = "all_transactions_with_users";
      await redisClient.del(cacheKeyToInvalidate);
      console.log(
        `Cache "${cacheKeyToInvalidate}" dihapus setelah transaksi updated dibuat.`
      );
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
      const cacheKeyToInvalidate = "all_transactions_with_users";
      await redisClient.del(cacheKeyToInvalidate);
      console.log(
        `Cache "${cacheKeyToInvalidate}" dihapus setelah transaksi single delete dibuat.`
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
      const cacheKeyToInvalidate = "all_transactions_with_users";
      await redisClient.del(cacheKeyToInvalidate);
      console.log(
        `Cache "${cacheKeyToInvalidate}" dihapus setelah transaksi delete all dibuat.`
      );
      return deletedTransactions;
    } catch (error) {
      console.error("Error deleting all transactions:", error);
      throw error;
    }
  },
};

module.exports = TransactionModel;
