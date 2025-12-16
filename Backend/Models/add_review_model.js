const mongoose = require('mongoose')
const Schema = mongoose.Schema

const addReviewSchema = new Schema({
    userId: {type: String, required: true},
    courseId: {type: String, required: true},
    reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    theory_mem_rating: {type: Number, min: 1, max: 5, required: true},
    lab_difficulty_rating: {type: Number, min: 1, max: 5, required: true},
    assignment_difficulty_rating: {type: Number, min: 1, max: 5, required: true},
    project_difficulty_rating: {type: Number, min: 1, max: 5, required: true},
    resources_availability_rating: {type: Number, min: 1, max: 5, required: true},
    written_review: {type: String, required: false, maxlength: 1000}
}, { timestamps: true })

module.exports = mongoose.model('AddReview', addReviewSchema)
    