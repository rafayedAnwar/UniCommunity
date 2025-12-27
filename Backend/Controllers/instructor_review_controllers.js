const InstructorReview = require("../Models/instructor_review_model");

// GET all instructor reviews (aggregated)
const getInstructorReviews = async (req, res) => {
  try {
    const reviews = await InstructorReview.find({}).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET reviews for a specific instructor
const getInstructorReviewByName = async (req, res) => {
  try {
    const { instructorName } = req.params;
    const review = await InstructorReview.findOne({
      instructorName: new RegExp(`^${instructorName}$`, "i"),
    });
    if (!review) {
      return res.status(404).json({ error: "No review found for this instructor" });
    }
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search by name or initial (partial, case-insensitive)
const searchInstructorReviews = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Query required" });
    }
    const regex = new RegExp(q, "i");
    const results = await InstructorReview.find({
      $or: [{ instructorName: regex }, { initial: regex }],
    }).sort({ instructorName: 1 });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Internal helper to update aggregate doc
const updateInstructorAggregate = async (review) => {
  try {
    await InstructorReview.findOneAndUpdate(
      { instructorName: review.instructorName },
      {
        $inc: {
          reviewCount: 1,
          clarity_total: review.clarity,
          fairness_total: review.fairness,
          helpfulness_total: review.helpfulness,
        },
        $push: {
          writtenReviews: {
            userId: review.reviewed_by,
            text: review.comment,
          },
        },
        $setOnInsert: {
          instructorName: review.instructorName,
        },
        ...(review.initial
          ? {
              $set: { initial: review.initial },
            }
          : {}),
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("Error updating instructor aggregate: ", err.message);
  }
};

// POST create a new instructor review
const createInstructorReview = async (req, res) => {
  const { instructorName, initial, clarity, fairness, helpfulness, comment } =
    req.body;
  const reviewed_by = req.user?._id || req.user?.id;
  if (!reviewed_by) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const numericClarity = Number(clarity);
    const numericFairness = Number(fairness);
    const numericHelpfulness = Number(helpfulness);
    if (
      !instructorName ||
      Number.isNaN(numericClarity) ||
      Number.isNaN(numericFairness) ||
      Number.isNaN(numericHelpfulness)
    ) {
      return res
        .status(400)
        .json({ error: "instructorName, clarity, fairness, and helpfulness are required" });
    }

    const review = {
      instructorName: instructorName.trim(),
      initial: initial ? initial.trim().toUpperCase() : "",
      reviewed_by,
      clarity: numericClarity,
      fairness: numericFairness,
      helpfulness: numericHelpfulness,
      comment,
    };

    await updateInstructorAggregate(review);
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createInstructorReview,
  getInstructorReviews,
  getInstructorReviewByName,
  searchInstructorReviews,
};
