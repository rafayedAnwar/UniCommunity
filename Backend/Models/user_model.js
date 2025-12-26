const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    googleId: { type: String, required: true, unique: true },
    googleRefreshToken: { type: String, required: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photo: { type: String, required: false },
    bio: { type: String, maxlength: 500, default: "" },
    socialLinks: {
      linkedIn: { type: String, default: "" },
      github: { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },
    currentCourses: [
      {
        code: { type: String, required: true },
        name: { type: String, required: true },
        cgpa: { type: Number, required: false, min: 0, max: 4 },
        credits: { type: Number, required: false, min: 0 },
      },
    ],
    completedCourses: [
      {
        code: { type: String, required: true },
        name: { type: String, required: true },
        cgpa: { type: Number, required: false, min: 0, max: 4 },
        credits: { type: Number, required: false, min: 0 },
      },
    ],
    badges: [
      {
        badgeId: { type: String, required: true },
        dateEarned: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
