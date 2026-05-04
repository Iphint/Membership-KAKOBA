const EventsModel = require("../models/EventsModel");
const { notifyAllUsers } = require("../services/NotificationService");

exports.createEvents = async (req, res) => {
  try {
    const eventData = req.body;
    const imageFiles = req.files;
    const requiredFields = [
      "event_name",
      "event_date",
      "location",
      "description",
    ];
    for (const field of requiredFields) {
      if (!eventData[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }
    const result = await EventsModel.createEvents(eventData, imageFiles);
    await notifyAllUsers(
      "Event Baru!",
      `Event "${eventData.event_name}" akan berlangsung pada ${eventData.event_date} di ${eventData.location}.`
    );
    res.status(201).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
exports.getEvents = async (req, res) => {
  try {
    const result = await EventsModel.getEvents();
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
exports.getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await EventsModel.getEventById(parseInt(id));
    if (!result) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    let imagesToDelete = [];

    if (req.body.imagesToDelete) {
      imagesToDelete =
        typeof req.body.imagesToDelete === "string"
          ? JSON.parse(req.body.imagesToDelete)
          : req.body.imagesToDelete;
    }

    const result = await EventsModel.updateEvent(
      Number(id),
      req.body,
      req.files,
      imagesToDelete
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await EventsModel.deleteEvent(parseInt(id));
    if (result.status === "error") {
      return res.status(404).json({ message: result.message });
    }
    res.status(200).json({
      message: "Event deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
