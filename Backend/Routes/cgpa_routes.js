const express = require("express");
const router = express.Router();
const {
  getCGPAData,
  addCourse,
  updateCourse,
  deleteCourse,
  getExportData,
  resetCalculator,
} = require("../Controllers/cgpa_controllers");

// GET request to get export data for Google Sheets (must come before /:userId)
router.get("/:userId/export", getExportData);

// DELETE request to reset calculator (must come before /:userId)
router.delete("/:userId/reset", resetCalculator);

// POST request to add a course
router.post("/:userId/courses", addCourse);

// PUT request to update a course
router.put("/:userId/courses/:courseId", updateCourse);

// DELETE request to delete a course
router.delete("/:userId/courses/:courseId", deleteCourse);

// GET request to get user's CGPA calculator data
router.get("/:userId", getCGPAData);

module.exports = router;
