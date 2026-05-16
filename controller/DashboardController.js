const DashboardModel = require("../models/DashboardModel");

exports.getDashboardSummary = async (req, res) => {
  try {
    const summary = await DashboardModel.getSummary();

    return res.status(200).json({
      message: "Dashboard summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
