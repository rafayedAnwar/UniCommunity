const mongoose = require('mongoose')

const courseReviewSchema = new mongoose.Schema({
    courseId: {type: String, required: true, unique: true},
    courseTitle: {type: String, required: true},
    reviewCount: {type: Number, default: 0},
    theory_mem_total: { type: Number, default: 0 },
    lab_difficulty_total: { type: Number, default: 0 },
    assignment_difficulty_total: { type: Number, default: 0 },
    project_difficulty_total: { type: Number, default: 0 },
    resources_availability_total: { type: Number, default: 0 },
    writtenReviews: [{ userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
                       text: {type: String, required: true}, 
                       createdAt: {type: Date, default: Date.now}}]  
}, { timestamps: true })

module.exports = mongoose.model('CourseReview', courseReviewSchema)
