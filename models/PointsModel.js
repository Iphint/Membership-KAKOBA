const { PrismaClient } = require("@prisma/client");
const { get } = require("../routes/UserRoutes");
const prisma = new PrismaClient();

const PointsModel = {
  getAllPoints: async () => {
    try {
      const points = await prisma.point.findMany({
        include: {
          user: true,
        },
      });
      return {
        status: "success",
        message: "Points fetched successfully",
        data: points,
      };
    } catch (error) {
      console.error("Error fetching points:", error);
      throw error;
    }
  },

  getPointsByUserId: async (user_id) => {
    try {
      const points = await prisma.point.findFirst({
        where: { user_id: parseInt(user_id) },
        include: { user: true },
      });
      if (!points) {
        return { status: "error", message: "Points not found" };
      }
      return { status: "success", data: points };
    } catch (error) {
      console.error("Error fetching points by user ID:", error);
      throw error;
    }
  },
};

module.exports = PointsModel;
