const express = require("express");
const router = express.Router();
const {
  createListing,
  listListings,
  joinListing,
  createTrelloForListing,
} = require("../Controllers/project_listing_controllers");

// Auth wrapper
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated())
    return res.status(401).json({ error: "Unauthorized" });
  next();
};

router.use(requireAuth);

router.post("/", createListing);
router.get("/", listListings);
router.post("/:listingId/join", joinListing);
router.post("/:listingId/trello", createTrelloForListing);

module.exports = router;
