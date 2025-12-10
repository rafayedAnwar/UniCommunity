const mongoose = require("mongoose")
const Schema = mongoose.Schema

const courseSchema = new Schema({
    course_code: { type: String, required: true, unique: true },
    course_name: { type: String, required: true },
    course_prerequisites: { type: [String], default: [] },
    course_description: { type: String, required: true }
})

module.exports = mongoose.model("Course", courseSchema)