const express = require('express') //to get express overall
const router = express.Router() //to get express router
const { postDiscussionThread, getallDiscussionThreads } = require('../Controllers/discussion_controllers') //import from controllers



//POST request to create a new Discussion Thread
router.post('/create', postDiscussionThread)

//GET request to get all Discussion Threads for a specific course
router.get('/:course_code', getallDiscussionThreads)

module.exports = router
