const TransactionModel = require("../models/TransactionModel");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const {
  buildPaginationMeta,
  getPaginationParams,
} = require("../utils/pagination");

const ALLOWED_EARN_TYPES = ["earn"];
const RECEIPT_TOTAL_KEYWORDS = [
  "total",
  "subtotal",
  "sub total",
  "tunai",
  "cash",
  "kembali",
  "change",
  "diskon",
  "discount",
  "tax",
  "pajak",
  "ppn",
  "receipt number",
  "table name",
  "collected by",
  "visit us",
];

const parsePositiveNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const normalizeItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      name_product_transaction: String(
        item.name_product_transaction || ""
      ).trim(),
      price_product_transaction: parsePositiveNumber(
        item.price_product_transaction
      ),
      quantity_product_transaction: parsePositiveNumber(
        item.quantity_product_transaction
      ),
    }))
    .filter(
      (item) =>
        item.name_product_transaction &&
        item.price_product_transaction &&
        item.quantity_product_transaction
    );
};

const parseReceiptItems = (rawText) => {
  const lines = rawText
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const items = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    const isSummaryLine = RECEIPT_TOTAL_KEYWORDS.some((keyword) =>
      lowerLine.includes(keyword)
    );

    if (isSummaryLine) continue;

    const priceMatch = line.match(/(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+)/i);

    if (!priceMatch) continue;

    const beforePrice = line.slice(0, priceMatch.index).trim();

    const itemMatch = beforePrice.match(/(.+?)\s+x\s*([0-9lI])$/i);

    if (!itemMatch) continue;

    let name = itemMatch[1].trim();
    let qtyText = itemMatch[2].toLowerCase();

    const quantity = qtyText === "l" || qtyText === "i" ? 1 : Number(qtyText);

    const price = Number(priceMatch[1].replace(/[.,]/g, ""));

    name = name
      .replace(/^[^a-zA-Z0-9]+/, "")
      .replace(/^(af|ha|br|kn|xv|on|w|hh|ft|his|ji|sid|or)\s+/i, "")
      .trim();

    if (name && price > 0 && quantity > 0) {
      items.push({
        name_product_transaction: name,
        price_product_transaction: price,
        quantity_product_transaction: quantity,
      });
    }
  }

  return items;
};

const deleteUploadedFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { user_id, items, point_transaction, type = "earn" } = req.body;

    if (!user_id) {
      return res.status(400).json({
        message: "Target user_id is required",
      });
    }

    if (!ALLOWED_EARN_TYPES.includes(type)) {
      return res.status(400).json({
        message: "Manual transaction type must be earn",
      });
    }

    const cleanItems = normalizeItems(items);

    if (cleanItems.length === 0) {
      return res.status(400).json({
        message:
          "Items must be a non-empty array with valid name, price, and quantity",
      });
    }

    const parsedPoint = parsePositiveNumber(point_transaction);

    if (!parsedPoint) {
      return res.status(400).json({
        message: "Point transaction must be a positive number",
      });
    }

    const targetUser = await TransactionModel.getUserById(user_id);

    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const transaction = await TransactionModel.createTransaction(
      targetUser.id,
      cleanItems,
      parsedPoint,
      type
    );

    return res.status(201).json({
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.scanReceipt = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Receipt image is required",
      });
    }

    if (!user_id) {
      deleteUploadedFile(req.file.path);
      return res.status(400).json({
        message: "Target user_id is required",
      });
    }

    const targetUser = await TransactionModel.getUserById(user_id);

    if (!targetUser) {
      deleteUploadedFile(req.file.path);
      return res.status(404).json({
        message: "Target user not found",
      });
    }

    const imagePath = req.file.path;

    const result = await Tesseract.recognize(imagePath, "eng+ind", {
      logger: (m) => console.log(m.status, m.progress),
    });

    const rawText = result.data.text;

    deleteUploadedFile(imagePath);

    const items = parseReceiptItems(rawText);

    if (items.length === 0) {
      return res.status(422).json({
        message: "Receipt scanned, but no valid items were found",
        raw_text: rawText,
        items: [],
      });
    }

    const total = items.reduce((sum, item) => {
      return (
        sum + item.price_product_transaction * item.quantity_product_transaction
      );
    }, 0);

    const suggested_point = Math.floor(total / 1000);

    return res.status(200).json({
      message: "Receipt scanned successfully",
      user: {
        id: targetUser.id,
        username: targetUser.username,
      },
      raw_text: rawText,
      items,
      total,
      suggested_point,
      type: "earn",
    });
  } catch (error) {
    console.error("Error scanning receipt:", error);
    deleteUploadedFile(req.file?.path);

    return res.status(500).json({
      message: "Failed to scan receipt",
    });
  }
};
exports.createReedemTransaction = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { items, point_transaction } = req.body;
    if (
      !user_id ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !point_transaction
    ) {
      return res.status(400).json({
        message:
          "All fields are required. Make sure to provide an items array and point_transaction.",
      });
    }
    const transaction = await TransactionModel.createRedeemTransaction(
      user_id,
      items,
      point_transaction,
      "redeem"
    );

    res.status(201).json({
      message: "Redeem transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Error creating redeem transaction:", error);
    if (error.message.includes("Insufficient points")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getAllTransactions = async (req, res) => {
  try {
    const paginationParams = getPaginationParams(req.query);
    const result = await TransactionModel.getAllTransactions(paginationParams);

    res.status(200).json({
      message: "Transactions fetched successfully",
      data: result.data,
      pagination: buildPaginationMeta({
        ...paginationParams,
        totalItems: result.totalItems,
      }),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await TransactionModel.getTransactionById(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({
      message: "Transaction fetched successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Error fetching transaction by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getTransactionsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const paginationParams = getPaginationParams(req.query);
    const result = await TransactionModel.getTransactionsByUserId(
      user_id,
      paginationParams
    );
    const transactions = result.data;

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        message: "No transactions found for this user",
        data: [],
        pagination: buildPaginationMeta({
          ...paginationParams,
          totalItems: result.totalItems,
        }),
      });
    }
    res.status(200).json({
      message: "Transactions fetched successfully",
      data: transactions,
      pagination: buildPaginationMeta({
        ...paginationParams,
        totalItems: result.totalItems,
      }),
    });
  } catch (error) {
    console.error("Error fetching transactions by user ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name_product_transaction,
      price_product_transaction,
      quantity_product_transaction,
      point_transaction,
    } = req.body;
    if (
      !name_product_transaction ||
      !price_product_transaction ||
      !quantity_product_transaction ||
      !point_transaction
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const updatedTransaction = await TransactionModel.updateTransaction(id, {
      name_product_transaction,
      price_product_transaction,
      quantity_product_transaction,
      point_transaction,
    });

    res.status(200).json({
      message: "Transaction updated successfully",
      data: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.updateReedemTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { qr_code_token } = req.body;

    if (!id || !qr_code_token) {
      return res.status(400).json({
        status: "error",
        message: "Transaction ID and QR code token are required",
      });
    }

    const result = await TransactionModel.updateTransactionQRCode(
      id,
      qr_code_token
    );

    if (result.count === 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid QR code token or QR already used",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "QR code verified successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in updateReedemTransaction:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTransaction = await TransactionModel.deleteTransaction(id);

    if (!deletedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({
      message: "Transaction deleted successfully",
      data: deletedTransaction,
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.deleteAllTransactions = async (req, res) => {
  try {
    const deletedTransactions = await TransactionModel.deleteAllTransactions();
    res.status(200).json({
      message: "All transactions deleted successfully",
      data: deletedTransactions,
    });
  } catch (error) {
    console.error("Error deleting all transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
