const express = require("express");
const EventsController = require("../controller/EventsController");
const { verifyToken } = require("../middleware/AuthMiddleware");
const { admin, general } = require("../config/Auth");
const upload = require("../middleware/Upload");

const router = express.Router();

router.post(
  "/events",
  verifyToken,
  admin,
  upload.array("images", 5),
  EventsController.createEvents
);
router.get("/events", verifyToken, general, EventsController.getEvents);
router.get("/event/:id", verifyToken, general, EventsController.getEventById);
router.put(
  "/event/:id",
  verifyToken,
  general,
  upload.array("images", 5),
  EventsController.updateEvent
);
router.delete(
  "/event/:id",
  verifyToken,
  admin,
  EventsController.deleteEvent
);

module.exports = router;
