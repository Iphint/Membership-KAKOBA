const express = require("express");
const router = express.Router();
const ImagesViewController = require("../controller/ImagesViewController");
const { verifyToken } = require("../middleware/AuthMiddleware");
const { admin } = require("../config/Auth");
const upload = require("../middleware/Upload");

router.post(
  "/image-view",
  verifyToken,
  admin,
  upload.single("image"),
  ImagesViewController.createImageViewScreen
);

router.get("/images-view", ImagesViewController.getAllImagesViewScreen);

module.exports = router;
