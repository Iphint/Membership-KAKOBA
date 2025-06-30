const PointsModel = require("../models/PointsModel");

exports.getAllPoints = async (req, res) => {
  try {
    const points = await PointsModel.getAllPoints();
    res.status(200).json({
      message: "Points fetched successfully",
      data: points,
    });
  } catch (error) {
    console.error("Error fetching points:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPointsByUserId = async (req, res) => {
  const userId = req.user.id;
  try {
    const points = await PointsModel.getPointsByUserId(userId);
    if (points.status === "error") {
      return res.status(404).json({ message: points.message });
    }
    res.status(200).json({
      message: "Points fetched successfully",
      data: points.data,
    });
  } catch (error) {
    console.error("Error fetching points by user ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
