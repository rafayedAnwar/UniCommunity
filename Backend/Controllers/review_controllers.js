const {request} = require('express')
const Review = require('../Models/review_model') //import review models


//GET Request to get all reviews
const getReviews = async (req, res) => {
    const reviews = await Review.find({}).sort({createdAt: -1})
    res.status(200).json(reviews)
}

//GET Request to get a single review by Course ID
const getReviewByCourseId = async (req, res) => {
    const {course_Id} = req.params

    const review = await Review.find({courseId: course_Id})

    if (!review) {
        return res.status(404).json({error: 'No review found for this course ID'})
    }   
    res.status(200).json(review)
}

// POST Request to create a new review
const createReview = async (req, res) => {
    const {courseId, 
           userId,
           theory_mem_rating,
           lab_difficulty_rating,
           assignment_rating,
           project_rating,
           resources_rating,
           written_review} = req.body

    try {
        const review = await Review.create(
            {courseId,
            userId,
            theory_mem_rating,
            lab_difficulty_rating,
            assignment_rating, 
            project_rating,
            resources_rating,
            written_review})
        res.status(201).json(review)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }}

//export to other files
module.exports = {createReview, getReviews, getReviewByCourseId}
