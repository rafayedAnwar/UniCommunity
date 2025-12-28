const express = require("express");
const router = express.Router();
const {
  createInstructorReview,
  getInstructorReviews,
  getInstructorReviewByName,
  searchInstructorReviews,
} = require("../Controllers/instructor_review_controllers");

// All routes require authentication
router.post("/", (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated())
    return res.status(401).json({ error: "Unauthorized" });
  createInstructorReview(req, res, next);
});

router.get("/all", (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated())
    return res.status(401).json({ error: "Unauthorized" });
  getInstructorReviews(req, res, next);
});

router.get("/search", (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated())
    return res.status(401).json({ error: "Unauthorized" });
  searchInstructorReviews(req, res, next);
});

router.get("/:instructorName", (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated())
    return res.status(401).json({ error: "Unauthorized" });
  getInstructorReviewByName(req, res, next);
});

module.exports = router;
