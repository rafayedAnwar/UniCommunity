const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getCurrentUser,
  getUserBadges,
  searchUsersByName,
} = require("../Controllers/user_controllers");



// All user routes are protected by inline authentication check
router.get("/search", (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
  searchUsersByName(req, res, next);
});
router.get("/", (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
  getAllUsers(req, res, next);
});
router.get("/current", (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
  getCurrentUser(req, res, next);
});
router.get("/:userId", (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
  getUserProfile(req, res, next);
});
router.get("/:userId/badges", (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
  getUserBadges(req, res, next);
});
router.put("/:userId", (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
  updateUserProfile(req, res, next);
});

module.exports = router;
