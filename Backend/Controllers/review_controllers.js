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
        if (!review) {
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
                    theory_total: review.theory,
                    lab_total: review.lab,
                    assignment_total: review.assignment,
                    project_total: review.project,
                    resources_total: review.resources
                },
                $push: {
                    writtenReviews: {
                        userId: review.reviewed_by,
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
    const {courseId, theory, 
        lab, assignment,
        project, resources, written_review
        } = req.body
    
    const reviewed_by = req.user?._id || req.user?.id
    if (!reviewed_by) {return res.status(401).json({ error: 'User not authenticated' })}    

    try {
        const review = await AddReview.create(
            {courseId, reviewed_by, theory, lab, assignment, project, resources, written_review})

        await updateCourseReview(review)
        res.status(201).json(review)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

//export to other files
module.exports = {createReview, getReviews, getReviewByCourseId}
