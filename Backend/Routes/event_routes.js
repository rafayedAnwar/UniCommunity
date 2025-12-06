const express = require("express");
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpToEvent,
  removeRsvp,
} = require("../Controllers/event_controllers");

// GET request to get all events (with optional filters)
router.get("/", getEvents);

// GET request to get a single event by ID
router.get("/:id", getEventById);

// POST request to create a new event
router.post("/", createEvent);

// PUT request to update an event
router.put("/:id", updateEvent);

// DELETE request to delete an event
router.delete("/:id", deleteEvent);

// POST request to RSVP to an event
router.post("/:id/rsvp", rsvpToEvent);

// DELETE request to remove RSVP from an event
router.delete("/:id/rsvp", removeRsvp);

module.exports = router;
