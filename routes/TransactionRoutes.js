const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const TransactionController = require("../controller/TransactionController");
const { verifyToken } = require("../middleware/AuthMiddleware");
const { user, general, admin } = require("../config/Auth");

const receiptUploadDir = "upload-struck/";

const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(receiptUploadDir, { recursive: true });
    cb(null, receiptUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: receiptStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = [".jpg", ".jpeg", ".png"];

    if (!allowedExt.includes(ext)) {
      return cb(new Error("Only receipt images are allowed"), false);
    }

    cb(null, true);
  },
});

router.get(
  "/transactions",
  verifyToken,
  admin,
  TransactionController.getAllTransactions
);
router.post(
  "/transaction",
  verifyToken,
  admin,
  TransactionController.createTransaction
);
router.post(
  "/scan-receipt",
  verifyToken,
  admin,
  upload.single("receipt"),
  TransactionController.scanReceipt
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
