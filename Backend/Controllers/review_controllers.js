const AddReview = require('../Models/add_review_model') //import individual review models
const CourseReview = require('../Models/course_review_model') //import course overall review model

//GET Request to get all reviews
const getReviews = async (req, res) => {
    try {
        const reviews = await CourseReview.find({}).sort({createdAt: -1})
        res.status(200).json(reviews)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }   
}

//GET Request to get a single review by Course ID
const getReviewByCourseId = async (req, res) => {
    try {
        const {courseId} = req.params
        const review = await CourseReview.findOne({courseId: courseId})
        if (review.length === 0) {
            return res.status(404).json({error: 'No review found for this course ID'})
        }    
        res.status(200).json(review)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

//UPDATE course overall review

const updateCourseReview = async (review) => {
    try {   await CourseReview.findOneAndUpdate(
            {courseId: review.courseId},
            {
                $inc: {
                    reviewCount: 1,
                    theory_mem_total: review.theory_mem_rating,
                    lab_difficulty_total: review.lab_difficulty_rating,
                    assignment_difficulty_total: review.assignment_difficulty_rating,
                    project_difficulty_total: review.project_difficulty_rating,
                    resources_availability_total: review.resources_availability_rating
                },
                $push: {
                    writtenReviews: {
                        userId: review.userId,
                        text: review.written_review
                    }        
                }
            }, {upsert: true, new: true})
    } catch (err) {
        console.error('Error Handling Course Review: ', err.message)
    }
}


// POST Request to create a new review
const createReview = async (req, res) => {
    const {userId, courseId, theory_mem_rating, 
           lab_difficulty_rating, assignment_difficulty_rating,
           project_difficulty_rating, resources_availability_rating, written_review
           } = req.body

    try {
        const review = await AddReview.create(
            {userId, courseId, theory_mem_rating, 
           lab_difficulty_rating, assignment_difficulty_rating,
           project_difficulty_rating, resources_availability_rating, written_review})
        

        await updateCourseReview(review)
        res.status(201).json(review)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

//export to other files
module.exports = {createReview, getReviews, getReviewByCourseId}
