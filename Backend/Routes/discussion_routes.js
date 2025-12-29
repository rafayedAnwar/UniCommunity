const express = require('express') //to get express overall
const router = express.Router() //to get express router
const { postDiscussionThread, getallDiscussionThreads, likeThread, dislikeThread, addCommentToThread } = require('../Controllers/discussion_controllers') //import from controllers

//POST request to create a new Discussion Thread
router.post('/create', postDiscussionThread)

//GET request to get all Discussion Threads for a specific course
router.get('/:course_code', getallDiscussionThreads)

//POST a comment on a discussion thread
router.post('/comment/:threadId', addCommentToThread)

//UPDATE likes for a specific course
router.put('/like/:threadId', likeThread)

//UPDATE dislikes for a specific course
router.put('/dislike/:threadId', dislikeThread)


module.exports = router
