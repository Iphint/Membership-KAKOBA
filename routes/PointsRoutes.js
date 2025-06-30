const express = require("express");
const router = express.Router();
const PointsController = require("../controller/PointsController");
const { verifyToken } = require("../middleware/AuthMiddleware");
const { admin, user } = require("../config/Auth");

router.get("/points", verifyToken, admin, PointsController.getAllPoints);
router.get("/points/user", verifyToken, user, PointsController.getPointsByUserId);

module.exports = router;
