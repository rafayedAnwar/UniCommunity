const mongoose = require("mongoose");
const Schema = mongoose.Schema;


//add forum contribution
const userContribution = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    discussion_thread: { type: Number, required: true },
    discussion_comment: { type: Number, required: true },
    review: { type: Number, required: true},
})


module.exports = mongoose.model("UserContribution", userContribution);