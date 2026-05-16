const express = require("express");
const router = express.Router();
const DashboardController = require("../controller/DashboardController");
const { verifyToken } = require("../middleware/AuthMiddleware");
const { admin } = require("../config/Auth");

router.get(
  "/dashboard-summary",
  verifyToken,
  admin,
  DashboardController.getDashboardSummary
);

module.exports = router;
