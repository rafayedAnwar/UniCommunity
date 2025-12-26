const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    eventType: { type: String, enum: ["academic", "social"], required: true },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    location: { type: String, required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    organizerName: { type: String, required: true },
    openForAll: { type: Boolean, default: true },
    maxAttendees: { type: Number, required: false },
    rsvps: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        userName: { type: String, required: true },
        rsvpStatus: {
          type: String,
          enum: ["going", "interested", "not_going"],
          default: "going",
        },
        rsvpDate: { type: Date, default: Date.now },
      },
    ],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
