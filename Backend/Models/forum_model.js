const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const resourceSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    fileUrl: { type: String, required: false },
    fileType: { type: String, required: true },
    fileName: { type: String, required: false },
    fileData: { type: String, required: false },
    fileSize: { type: Number, required: false },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploaderName: { type: String, required: true },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const forumSchema = new Schema(
  {
    courseCode: { type: String, required: true, unique: true },
    courseName: { type: String, required: true },
    description: { type: String, default: "" },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    resources: [resourceSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Forum", forumSchema);
