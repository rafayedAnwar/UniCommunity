const express = require('express') //to get express overall
const router = express.Router() //to get express router
const { incDiscussionComment, incDiscussionThread, incReview, getTopThree } = require('../Controllers/contribution_controllers') //import from controllers

//UPDATE thread contribution
router.put('/thread/:userId', incDiscussionThread)

//UPDATE thread comment contribution
router.put('/thread_comment/:userId', incDiscussionComment)

//UPDATE Review contribution
router.put('/review/:userId', incReview)

//GET top five contributors:
router.get('/getTop', getTopThree)

module.exports = router