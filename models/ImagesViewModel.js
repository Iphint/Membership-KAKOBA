const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ImagesViewsModel = {
  createImageView: async (title, sub_title, image_url) => {
    try {
      return await prisma.imageViewScreen.create({
        data: {
          title,
          sub_title,
          image_url,
        },
      });
    } catch (error) {
      console.error("Error creating image view:", error);
      throw error;
    }
  },

  getAllImagesView: async () => {
    try {
      return await prisma.imageViewScreen.findMany();
    } catch (error) {
      console.error("Error fetching images views:", error);
      throw error;
    }
  },

  deleteImageView: async (id) => {
    try {
      return await prisma.imageViewScreen.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Error deleting image view:", error);
      throw error;
    }
  },
};

module.exports = ImagesViewsModel;
