const mongoose = require('mongoose')
const Schema = mongoose.Schema

const addReviewSchema = new Schema({
    courseId: {type: String, required: true},
    reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    theory: {type: Number, min: 1, max: 5, required: true},
    lab: {type: Number, min: 1, max: 5, required: true},
    assignment: {type: Number, min: 1, max: 5, required: true},
    project: {type: Number, min: 1, max: 5, required: true},
    resources: {type: Number, min: 1, max: 5, required: true},
    written_review: {type: String, required: false, maxlength: 1000}
}, { timestamps: true })

module.exports = mongoose.model('AddReview', addReviewSchema)
