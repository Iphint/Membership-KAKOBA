const express = require("express");
const router = express.Router();
const TransactionController = require("../controller/TransactionController");
const { verifyToken } = require("../middleware/AuthMiddleware");
const { user, general, admin } = require("../config/Auth");

router.get(
  "/transactions",
  verifyToken,
  admin,
  TransactionController.getAllTransactions
);
router.post(
  "/transaction",
  verifyToken,
  general,
  TransactionController.createTransaction
);
router.post(
  "/reedem-transaction",
  verifyToken,
  general,
  TransactionController.createReedemTransaction
);
router.get(
  "/transaction/:id",
  verifyToken,
  general,
  TransactionController.getTransactionById
);
router.get(
  "/transactions/user/:user_id",
  verifyToken,
  user,
  TransactionController.getTransactionsByUserId
);
router.put(
  "/transaction/:id",
  verifyToken,
  general,
  TransactionController.updateTransaction
);
router.delete(
  "/transaction/:id",
  verifyToken,
  general,
  TransactionController.deleteTransaction
);
router.delete(
  "/transactions",
  verifyToken,
  admin,
  TransactionController.deleteAllTransactions
);
router.put(
  "/transaction/redeem/:id",
  verifyToken,
  admin,
  TransactionController.updateReedemTransaction
);

module.exports = router;
