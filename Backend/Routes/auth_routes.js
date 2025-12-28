const express = require("express");
const passport = require("passport");
const router = express.Router();

// 1. Initiate Google Login
// Scope determines what user information you request from Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
    accessType: "offline",
    prompt: "consent",
  })
);

// 2. Google Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
  }),
  (req, res) => {
    // req.user always exists here because passport creates user if not found
    res.redirect("http://localhost:3000/profile");
  }
);

// Get current authenticated user
router.get("/current", (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Logout Route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    // Passport's logout method
    if (err) {
      return next(err);
    }
    res.redirect("http://localhost:3000/login"); // Redirect to login page
  });
});

module.exports = router;
