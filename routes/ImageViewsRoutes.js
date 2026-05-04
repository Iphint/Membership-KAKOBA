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

router.delete(
  "/image-view/:id",
  verifyToken,
  admin,
  ImagesViewController.deleteImageViewScreen
);

router.put(
  "/image-view/:id",
  verifyToken,
  admin,
  upload.single("image"),
  ImagesViewController.updateImageViewScreen
);

router.get(
  "/image-view/:id",
  verifyToken,
  admin,
  ImagesViewController.getImageViewScreenById
);

router.get("/images-view", ImagesViewController.getAllImagesViewScreen);

module.exports = router;
