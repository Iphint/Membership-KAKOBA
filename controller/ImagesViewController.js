const ImagesViewsModel = require("../models/ImagesViewModel");
const path = require("path");

exports.createImageViewScreen = async (req, res) => {
  try {
    const { title, sub_title } = req.body;

    if (!title || !sub_title) {
      return res.status(400).json({
        message: "Title and sub title are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Image is required (only 1 image allowed)",
      });
    }

    const image_url = path.basename(req.file.path);

    const imageView = await ImagesViewsModel.createImageView(
      title,
      sub_title,
      image_url
    );

    res.status(201).json({
      message: "Image view created successfully",
      data: imageView,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.getAllImagesViewScreen = async (req, res) => {
  try {
    const imagesViews = await ImagesViewsModel.getAllImagesView();
    res.status(200).json({
      data: imagesViews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.deleteImageViewScreen = async (req, res) => {
  try {
    const { id } = req.params;
    await ImagesViewsModel.deleteImageView(id);
    res.status(200).json({
      message: "Image view deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
}
