const mongoose = require("mongoose")
const Schema = mongoose.Schema

const discussionThreadSchema = new Schema(
  {
    course_code: { type: String, required: true },
    posted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    header_text: { type: String, required: true },
    main_text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        commented_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }}],
}, { timestamps: true })



module.exports = mongoose.model("DiscussionThread", discussionThreadSchema)
