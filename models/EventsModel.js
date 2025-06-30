const { PrismaClient } = require("@prisma/client");
const { get } = require("../routes/UserRoutes");
const prisma = new PrismaClient();

const EventsModel = {
  createEvents: async (eventData, imageFiles) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Simpan data event utama
        const newEvent = await tx.events.create({
          data: {
            event_name: eventData.event_name,
            event_date: new Date(eventData.event_date),
            location: eventData.location,
            description: eventData.description,
          },
        });

        // 2. Simpan gambar ke tabel ImageEvent jika ada
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
  updateEvent: async (eventId, eventData, imageFiles) => {
    try {
      const existingEvent = await prisma.events.findUnique({
        where: { id: eventId },
      });

      if (!existingEvent) {
        return {
          status: "error",
          message: "Event not found",
        };
      }

      const updatedEvent = await prisma.$transaction(async (tx) => {
        // Update event details
        const updatedData = {
          event_name: eventData.event_name,
          event_date: new Date(eventData.event_date),
          location: eventData.location,
          description: eventData.description,
        };

        const updatedEvent = await tx.events.update({
          where: { id: eventId },
          data: updatedData,
        });

        // Handle image updates
        if (imageFiles && imageFiles.length > 0) {
          // Delete existing images
          await tx.imageEvent.deleteMany({
            where: { event_id: eventId },
          });

          // Add new images
          const imageRecords = imageFiles.map((file) => ({
            event_id: updatedEvent.id,
            image_url: file.filename,
          }));

          await tx.imageEvent.createMany({
            data: imageRecords,
          });
        }

        return updatedEvent;
      });

      return {
        status: "success",
        message: "Event updated successfully",
        data: updatedEvent,
      };
    } catch (error) {
      console.error("❌ Error updating event:", error);
      throw error;
    }
  }
};

module.exports = EventsModel;
