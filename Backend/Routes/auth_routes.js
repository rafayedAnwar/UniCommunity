const express = require('express')
const passport = require('passport')
const router = express.Router()

// 1. Initiate Google Login
// Scope determines what user information you request from Google
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// 2. Google Callback Route
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/failed'
  }),
  (req, res) => {
    // req.user always exists here because passport creates user if not found
    res.redirect('http://localhost:3000/dashboard')
  }
);

// Logout Route
router.get('/logout', (req, res, next) => {
  req.logout((err) => { // Passport's logout method
    if (err) { return next(err); }
    res.redirect('http://localhost:3000/login'); // Redirect to login page
  });
});

module.exports = router