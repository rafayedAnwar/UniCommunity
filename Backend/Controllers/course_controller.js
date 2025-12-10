const Course = require('../Models/course_model');

// POST new courses using PostMan
const postCourse = async (req, res) => {
    const { course_code, course_name, course_prerequisites, course_description } = req.body;
    try {
        const course = await Course.create({ course_code, course_name, course_prerequisites, course_description });
        res.status(201).json(course);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

//GET all courses
const getAll = async (req, res) => {
    try {
        const courses = await Course.find({});
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }   
}

//GET single course by ID
const getSpecific = async (req, res) => {
    const { id } = req.params;
    try {
        const course = await Course.findOne({ course_code: id });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {postCourse, getAll, getSpecific };