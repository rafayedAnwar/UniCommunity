const mongoose = require("mongoose");

const instructorReviewSchema = new mongoose.Schema(
  {
    instructorName: { type: String, required: true, unique: true },
    initial: { type: String, default: "" },
    reviewCount: { type: Number, default: 0 },
    clarity_total: { type: Number, default: 0 },
    fairness_total: { type: Number, default: 0 },
    helpfulness_total: { type: Number, default: 0 },
    writtenReviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("InstructorReview", instructorReviewSchema);
