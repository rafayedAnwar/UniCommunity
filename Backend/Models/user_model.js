const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    googleId: { type: String, required: true, unique: true },
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
      },
    ],
    completedCourses: [
      {
        code: { type: String, required: true },
        name: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
