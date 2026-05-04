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
        where: { id: Number(id) },
      });
    } catch (error) {
      console.error("Error deleting image view:", error);
      throw error;
    }
  },

  updateImageView: async (id, title, sub_title, image_url) => {
    return await prisma.imageViewScreen.update({
      where: { id: Number(id) },
      data: {
        title,
        sub_title,
        image_url,
      },
    });
  },

  getImageViewById: async (id) => {
    try {
      return await prisma.imageViewScreen.findUnique({
        where: { id: Number(id) },
      });
    } catch (error) {
      console.error("Error fetching image view by ID:", error);
      throw error;
    }
  },
};

module.exports = ImagesViewsModel;
