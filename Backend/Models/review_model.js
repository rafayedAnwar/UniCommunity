const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    courseId: {type: String, required: true},
    studentId: {type: String, required: true},
    theory_mem_rating: {type: Number, min: 1, max: 5, required: true},
    lab_difficulty_rating: {type: Number, min: 1, max: 5, required: true},
    assignment_rating: {type: Number, min: 1, max: 5, required: true},
    project_rating: {type: Number, min: 1, max: 5, required: true},
    resources_rating: {type: Number, min: 1, max: 5, required: true},
    written_review: {type: String, maxlength: 1275, required: false}
}, { timestamps: true })

module.exports = mongoose.model('Review', reviewSchema)
    