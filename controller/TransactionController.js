const TransactionModel = require("../models/TransactionModel");

exports.createTransaction = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { items, point_transaction, type } = req.body;
    if (
      !user_id ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !point_transaction
    ) {
      return res.status(400).json({
        message:
          "All fields are required. Make sure to provide an items array.",
      });
    }
    const transaction = await TransactionModel.createTransaction(
      user_id,
      items,
      point_transaction,
      "earn"
    );
    res.status(201).json({
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Internal server error" });
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
    const transactions = await TransactionModel.getAllTransactions();
    res.status(200).json({
      message: "Transactions fetched successfully",
      data: transactions,
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
    const transactions = await TransactionModel.getTransactionsByUserId(
      user_id
    );

    if (!transactions || transactions.length === 0) {
      return res
        .status(200)
        .json({ message: "No transactions found for this user" });
    }
    res.status(200).json({
      message: "Transactions fetched successfully",
      data: transactions,
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

    const result = await TransactionModel.updateTransactionQRCode(id, qr_code_token);

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
