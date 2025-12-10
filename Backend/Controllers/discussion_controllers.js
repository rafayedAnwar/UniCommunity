const DiscussionThread = require('../Models/discussion_thread_model');

// POST Request to post a new discussion thread
const postDiscussionThread = async (req, res) => {
    const { course_code, posted_by, header_text, main_text } = req.body;
    try {
        const thread = await DiscussionThread.create({ course_code, posted_by, header_text, main_text });
        res.status(201).json(thread);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

//Get Request to fetch all discussion threads for a specific course
const getallDiscussionThreads = async (req, res) => {
    const { course_code } = req.params;
    try {
        const threads = await DiscussionThread.find({ course_code });
        res.status(200).json(threads);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }   
}

module.exports = { postDiscussionThread, getallDiscussionThreads };


