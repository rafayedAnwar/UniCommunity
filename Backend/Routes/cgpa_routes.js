const express = require("express");
const router = express.Router();
const {
  getCGPAData,
  addCourse,
  updateCourse,
  deleteCourse,
  getExportData,
  exportToGoogleSheets,
  resetCalculator,
  syncProfileCoursesToCgpa,
} = require("../Controllers/cgpa_controllers");

// POST request to export data to Google Sheets (must come before /:userId/export)
router.post("/:userId/export/sheets", exportToGoogleSheets);

// GET request to get export data for Google Sheets (must come before /:userId)
router.get("/:userId/export", getExportData);

// PUT request to resync CGPA with completed courses (manual trigger if needed)
router.put("/:userId/sync", async (req, res) => {
  try {
    const data = await syncProfileCoursesToCgpa(req.params.userId);
    if (!data) return res.status(404).json({ error: "User not found" });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
