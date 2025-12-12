const express = require("express");
const router = express.Router();
const {
  getAllForums,
  getForumByCourse,
  createForum,
  joinForum,
  uploadResource,
  getForumResources,
  incrementDownload,
  deleteResource,
} = require("../Controllers/forum_controllers");

// GET request to get all forums
router.get("/", getAllForums);

// GET request to get forum by course code
router.get("/:courseCode", getForumByCourse);

// POST request to create a new forum
router.post("/", createForum);

// POST request to join a forum
router.post("/:courseCode/join", joinForum);

// GET request to get all resources for a forum
router.get("/:courseCode/resources", getForumResources);

// POST request to upload a resource
router.post("/:courseCode/resources", uploadResource);

// PUT request to increment download count
router.put("/:courseCode/resources/:resourceId/download", incrementDownload);

// DELETE request to delete a resource
router.delete("/:courseCode/resources/:resourceId", deleteResource);

module.exports = router;
