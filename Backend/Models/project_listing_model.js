const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectListingSchema = new Schema(
  {
    projectName: { type: String, required: true },
    courseCodes: [{ type: String, required: true }],
    skills: [{ type: String }],
    description: { type: String, required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    creatorName: { type: String, required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
      },
    ],
    trelloBoardId: { type: String, default: "" },
    trelloBoardUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProjectListing", projectListingSchema);
