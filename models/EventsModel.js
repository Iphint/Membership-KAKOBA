const { PrismaClient } = require("@prisma/client");
const { get } = require("../routes/UserRoutes");
const { deleteEvent } = require("../controller/EventsController");
const deleteFileIfExists = require("../utils/deleteCheckFiles");
const prisma = new PrismaClient();

const EventsModel = {
  createEvents: async (eventData, imageFiles) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const newEvent = await tx.events.create({
          data: {
            event_name: eventData.event_name,
            event_date: new Date(eventData.event_date),
            location: eventData.location,
            description: eventData.description,
          },
        });
        if (imageFiles && imageFiles.length > 0) {
          const imageRecords = imageFiles.map((file) => ({
            event_id: newEvent.id,
            image_url: file.filename,
          }));

          await tx.imageEvent.createMany({
            data: imageRecords,
          });
        }

        return newEvent;
      });

      return {
        status: "success",
        message: "Event created successfully",
        data: result,
      };
    } catch (error) {
      console.error("❌ Error creating event:", error);
      throw error;
    }
  },
  getEvents: async () => {
    try {
      const events = await prisma.events.findMany({
        include: {
          ImageEvent: true,
        },
      });
      return {
        status: "success",
        data: events,
      };
    } catch (error) {
      console.error("❌ Error fetching events:", error);
      throw error;
    }
  },
  getEventById: async (eventId) => {
    try {
      const event = await prisma.events.findUnique({
        where: { id: eventId },
        include: {
          ImageEvent: true,
        },
      });

      if (!event) {
        return {
          status: "error",
          message: "Event not found",
        };
      }
      return {
        status: "success",
        data: event,
      };
    } catch (error) {
      console.error("❌ Error fetching event by ID:", error);
      throw error;
    }
  },
  updateEvent: async (eventId, eventData, imageFiles, imagesToDelete = []) => {
    try {
      const existingEvent = await prisma.events.findUnique({
        where: { id: eventId },
        include: { ImageEvent: true },
      });

      if (!existingEvent) {
        return {
          status: "error",
          message: "Event not found",
        };
      }

      const updatedEvent = await prisma.$transaction(async (tx) => {
        // ================= UPDATE DATA =================
        const updated = await tx.events.update({
          where: { id: eventId },
          data: {
            event_name: eventData.event_name,
            event_date: new Date(eventData.event_date),
            location: eventData.location,
            description: eventData.description,
          },
        });

        // ================= DELETE SELECTED IMAGES =================
        if (imagesToDelete.length > 0) {
          const images = existingEvent.ImageEvent.filter((img) =>
            imagesToDelete.includes(img.id)
          );

          await Promise.all(
            images.map((img) => deleteFileIfExists(img.image_url))
          );

          await tx.imageEvent.deleteMany({
            where: {
              id: { in: imagesToDelete },
            },
          });
        }

        // ================= ADD NEW IMAGES =================
        if (imageFiles && imageFiles.length > 0) {
          await tx.imageEvent.createMany({
            data: imageFiles.map((file) => ({
              event_id: eventId,
              image_url: file.filename,
            })),
          });
        }

        return updated;
      });

      return {
        status: "success",
        message: "Event updated successfully",
        data: updatedEvent,
      };
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },
  deleteEvent: async (eventId) => {
    try {
      const existingEvent = await prisma.events.findUnique({
        where: { id: eventId },
        include: { ImageEvent: true },
      });

      if (!existingEvent) {
        return {
          status: "error",
          message: "Event not found",
        };
      }

      await prisma.$transaction(async (tx) => {
        if (existingEvent.ImageEvent && existingEvent.ImageEvent.length > 0) {
          await Promise.all(
            existingEvent.ImageEvent.map((image) =>
              deleteFileIfExists(image.image_url)
            )
          );

          await tx.imageEvent.deleteMany({
            where: { event_id: Number(eventId) },
          });

          console.log("🗑️ Deleted ImageEvent records for event_id:", eventId);
        }

        await tx.events.delete({
          where: { id: Number(eventId) },
        });

        console.log("🗑️ Deleted event record with ID:", eventId);
      });

      return {
        status: "success",
        message: "Event and related images deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },
};

module.exports = EventsModel;
