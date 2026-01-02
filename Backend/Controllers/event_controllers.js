const Event = require("../Models/event_model");

// GET Request to get all events
const getEvents = async (req, res) => {
  try {
    const { eventType, startDate, endDate } = req.query;
    let query = {};

    if (eventType && eventType !== "all") {
      // Handle openForAll filtering
      if (eventType === "open") {
        query.openForAll = true;
      } else if (eventType === "restricted") {
        query.openForAll = false;
      } else {
        // Handle academic/social filtering
        query.eventType = eventType;
      }
    }

    if (startDate || endDate) {
      query.startDateTime = {};
      if (startDate) query.startDateTime.$gte = new Date(startDate);
      if (endDate) query.startDateTime.$lte = new Date(endDate);
    }

    const events = await Event.find(query).sort({ startDateTime: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET Request to get a single event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST Request to create a new event
const createEvent = async (req, res) => {
  const {
    title,
    description,
    eventType,
    startDateTime,
    endDateTime,
    location,
    organizerId,
    organizerName,
    maxAttendees,
    tags,
    openForAll,
  } = req.body;

  try {
    const event = await Event.create({
      title,
      description,
      eventType,
      startDateTime,
      endDateTime,
      location,
      organizerId,
      organizerName,
      openForAll: openForAll !== undefined ? openForAll : true,
      maxAttendees,
      tags,
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT Request to update an event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user is the organizer
    if (event.organizerId.toString() !== req.body.userId) {
      return res
        .status(403)
        .json({ error: "Only the organizer can update this event" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        ...req.body,
        openForAll:
          req.body.openForAll !== undefined
            ? req.body.openForAll
            : event.openForAll,
      },
      {
        new: true,
      }
    );
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE Request to delete an event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user is the organizer
    if (event.organizerId.toString() !== req.body.userId) {
      return res
        .status(403)
        .json({ error: "Only the organizer can delete this event" });
    }

    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST Request to RSVP to an event
const rsvpToEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName, rsvpStatus } = req.body;

    if (!userId || !userName || !rsvpStatus) {
      return res
        .status(400)
        .json({ error: "userId, userName, and rsvpStatus are required" });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if max attendees limit reached (only for 'going' status)
    if (rsvpStatus === "going" && event.maxAttendees) {
      const goingCount = event.rsvps.filter(
        (rsvp) => rsvp.rsvpStatus === "going"
      ).length;
      if (goingCount >= event.maxAttendees) {
        return res.status(400).json({ error: "Event is full" });
      }
    }

    // Check if user already RSVPed
    const existingRsvpIndex = event.rsvps.findIndex(
      (rsvp) => rsvp.userId.toString() === userId
    );

    if (existingRsvpIndex !== -1) {
      // Update existing RSVP
      event.rsvps[existingRsvpIndex].rsvpStatus = rsvpStatus;
      event.rsvps[existingRsvpIndex].rsvpDate = Date.now();
    } else {
      // Add new RSVP
      event.rsvps.push({
        userId,
        userName,
        rsvpStatus,
        rsvpDate: Date.now(),
      });
    }

    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE Request to remove RSVP from an event
const removeRsvp = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    event.rsvps = event.rsvps.filter(
      (rsvp) => rsvp.userId.toString() !== userId
    );
    await event.save();

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpToEvent,
  removeRsvp,
};
