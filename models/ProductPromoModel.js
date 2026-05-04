const { PrismaClient } = require("@prisma/client");
const { get } = require("../routes/UserRoutes");
const path = require("path");
const fs = require("fs");
const deleteFileIfExists = require("../utils/deleteCheckFiles");
const prisma = new PrismaClient();

const ProductPromoModel = {
  createProductPromo: async (productData, imageFiles) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Simpan product promo
        const newProduct = await tx.productPromo.create({
          data: {
            product_name: productData.product_name,
            price_normal: parseInt(productData.price_normal),
            discount: parseInt(productData.discount),
            product_description: productData.product_description,
            product_category: productData.product_category,
            product_point: parseInt(productData.point),
            start_date: new Date(productData.start_date),
            end_date: new Date(productData.end_date),
            stock: parseInt(productData.stock),
            is_available:
              productData.is_available === "true" ||
              productData.is_available === true,
            is_featured:
              productData.is_featured === "true" ||
              productData.is_featured === true,
          },
        });

        // 2. Simpan gambar ke tabel ImagePromo
        if (imageFiles && imageFiles.length > 0) {
          const imageRecords = imageFiles.map((file) => ({
            product_id: newProduct.id,
            image_url: file.filename,
          }));

          await tx.imagePromo.createMany({
            data: imageRecords,
          });
        }

        return newProduct;
      });

      return {
        status: "success",
        message: "Product promo created successfully",
        data: result,
      };
    } catch (error) {
      console.error("Error creating product promo:", error);
      throw error;
    }
  },
  getAllProductPromos: async () => {
    try {
      const promos = await prisma.productPromo.findMany({
        include: {
          ImagePromo: true,
        },
      });
      return promos;
    } catch (error) {
      console.error("Error fetching all product promos:", error);
      throw error;
    }
  },
  getProductFeature: async () => {
    try {
      const featuredPromos = await prisma.productPromo.findMany({
        where: { is_featured: true },
        include: {
          ImagePromo: true,
        },
      });
      return featuredPromos;
    } catch (error) {
      console.error("Error fetching featured product promos:", error);
      throw error;
    }
  },
  getProductPromoById: async (id) => {
    try {
      const promo = await prisma.productPromo.findUnique({
        where: { id: parseInt(id) },
        include: {
          ImagePromo: true,
        },
      });
      return promo;
    } catch (error) {
      console.error("Error fetching product promo by ID:", error);
      throw error;
    }
  },
  deleteProductPromo: async (id) => {
    try {
      const promoId = parseInt(id);
      const promo = await prisma.productPromo.findUnique({
        where: { id: promoId },
        include: { ImagePromo: true },
      });

      if (!promo) {
        return {
          status: "error",
          message: "Product promo not found",
        };
      }
      for (const image of promo.ImagePromo) {
        const imagePath = path.join(process.cwd(), "uploads", image.image_url);
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
            console.log(`Deleted file: ${imagePath}`);
          } catch (err) {
            console.error(`Failed to delete file ${imagePath}:`, err);
          }
        }
      }
      await prisma.imagePromo.deleteMany({
        where: { product_id: promoId },
      });
      await prisma.productPromo.delete({
        where: { id: promoId },
      });
      return {
        status: "success",
        message: "Product promo and images deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting product promo:", error);
      return {
        status: "error",
        message: "Error deleting product promo",
        error: error.message,
      };
    }
  },
  updateProductPromo: async (id, data, newImages, imagesToDelete = []) => {
    try {
      const promoId = parseInt(id);

      const existingPromo = await prisma.productPromo.findUnique({
        where: { id: promoId },
        include: { ImagePromo: true },
      });

      if (!existingPromo) {
        throw new Error("Product promo not found");
      }

      // ================= DELETE IMAGES =================
      if (imagesToDelete && imagesToDelete.length > 0) {
        for (const imageId of imagesToDelete) {
          const imageToDelete = existingPromo.ImagePromo.find(
            (img) => img.id === parseInt(imageId)
          );

          if (imageToDelete) {
            console.log(`Deleting image ID: ${imageId}`);

            await deleteFileIfExists(imageToDelete.image_url);
            await prisma.imagePromo.delete({
              where: { id: parseInt(imageId) },
            });
            
            console.log(`✅ Deleted file & DB: ${imageId}`);
          } else {
            console.log(`⚠️ Image ID ${imageId} not found`);
          }
        }
      }

      // ================= UPDATE DATA =================
      const updatedPromo = await prisma.productPromo.update({
        where: { id: promoId },
        data: {
          product_name: data.product_name,
          price_normal: data.price_normal,
          discount: data.discount,
          product_description: data.product_description,
          product_category: data.product_category,
          start_date: new Date(data.start_date),
          end_date: new Date(data.end_date),
          stock: data.stock,
          is_available: data.is_available,
          is_featured: data.is_featured,
        },
      });

      // ================= ADD NEW IMAGES =================
      if (newImages && newImages.length > 0) {
        console.log(`➕ Adding ${newImages.length} new images`);

        const imageCreatePromises = newImages.map((file) =>
          prisma.imagePromo.create({
            data: {
              product_id: updatedPromo.id,
              image_url: file.filename,
            },
          })
        );

        await Promise.all(imageCreatePromises);

        console.log(`✅ Added ${newImages.length} new images`);
      }

      console.log("✅ Product promo updated successfully");

      return updatedPromo;
    } catch (error) {
      console.error("❌ Error updating product promo:", error);
      throw error;
    }
  },
};

module.exports = ProductPromoModel;
