const DiscussionThread = require('../Models/discussion_thread_model');
const UserContribution = require('../Models/contribution_model');

const { checkHelloWorldBadge } = require("./badge_utils");
// POST Request to post a new discussion thread
const postDiscussionThread = async (req, res) => {
    const { course_code, posted_by, header_text, main_text } = req.body;
    try {
        const thread = await DiscussionThread.create({ course_code, posted_by, header_text, main_text });
        // Award Hello World badge for discussion post
        if (posted_by) await checkHelloWorldBadge(posted_by);
        res.status(201).json(thread);
    } catch (error) {res.status(400).json({ error: error.message });}
}

//Get Request to fetch all discussion threads for a specific course
const getallDiscussionThreads = async (req, res) => {
    const { course_code } = req.params;
    try {
        const threads = await DiscussionThread.find({ course_code });
        res.status(200).json(threads);
    } catch (error) {res.status(400).json({ error: error.message });}   
}

const likeThread = async (req, res) => {
    const { threadId } = req.params;
    const { userId } = req.body;

    try {
        const thread = await DiscussionThread.findById(threadId);
        if (!thread) {
            return res.status(404).json({ message: "Thread not found" });}

        // Remove from dislikes if exists
        thread.dislikes = thread.dislikes.filter(
            id => id.toString() !== userId);

        // Toggle like
        if (thread.likes.includes(userId)) {
            thread.likes = thread.likes.filter(
                id => id.toString() !== userId);
                
        } else {thread.likes.push(userId);}
        
        await thread.save();
            res.status(200).json(thread);
    } catch (error) {res.status(400).json({ error: error.message });}
}

const dislikeThread = async (req, res) => {
    const { threadId } = req.params;
    const { userId } = req.body;

    try {
        const thread = await DiscussionThread.findById(threadId);
        if (!thread) {return res.status(404).json({ message: "Thread not found" });}

        // Remove from likes if exists
        thread.likes = thread.likes.filter(id => id.toString() !== userId);
        // Toggle dislike
        if (thread.dislikes.includes(userId)) {
            thread.dislikes = thread.dislikes.filter(id => id.toString() !== userId);
        } else {thread.dislikes.push(userId);}

        await thread.save();
            res.status(200).json(thread);
    } catch (error) {res.status(400).json({ error: error.message });}
}

const addCommentToThread = async (req, res) => {
    const { threadId } = req.params;
    const { userId, content } = req.body;

    if (!userId || !content) {return res.status(400).json({ message: "User and content are required" });}

    const trimmedContent = content.trim();
    if (!trimmedContent) {return res.status(400).json({ message: "Comment cannot be empty" });}
    if (trimmedContent.length > 500) {return res.status(400).json({ message: "Comment exceeds 500 characters" });}

    try {
        const thread = await DiscussionThread.findById(threadId);
        if (!thread) {return res.status(404).json({ message: "Thread not found" });}

        const newComment = {commented_by: userId, content: trimmedContent, createdAt: new Date(),};

        thread.comments.push(newComment);
        await thread.save();
        res.status(200).json(thread);
    } catch (error) {res.status(400).json({ error: error.message });}
};


module.exports = { postDiscussionThread, getallDiscussionThreads, likeThread, dislikeThread, addCommentToThread };


