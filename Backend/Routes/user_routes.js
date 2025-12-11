const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getCurrentUser,
} = require("../Controllers/user_controllers");

// GET request to get all users
router.get("/", getAllUsers);

// GET current user
router.get("/current", getCurrentUser)

// GET request to get user profile by ID
router.get("/:userId", getUserProfile);

// PUT request to update user profile
router.put("/:userId", updateUserProfile);

module.exports = router;
