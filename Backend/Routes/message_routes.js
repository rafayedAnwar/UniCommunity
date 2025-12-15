const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getUserConversations,
  deleteMessage,
  deleteConversation,
} = require("../Controllers/message_controllers");

// All message routes are protected by inline authentication check
router.post("/send/:recipientId", (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated())
    return res.status(401).json({ error: "Unauthorized" });
  sendMessage(req, res, next);
});
router.get("/conversation/:userId1/:userId2", (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated())
    return res.status(401).json({ error: "Unauthorized" });
  getConversation(req, res, next);
});
router.get("/conversations/:userId", (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated())
    return res.status(401).json({ error: "Unauthorized" });
  getUserConversations(req, res, next);
});

// Delete a specific message
router.delete("/:messageId", (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated())
    return res.status(401).json({ error: "Unauthorized" });
  deleteMessage(req, res, next);
});

// Delete entire conversation between two users
router.delete("/conversation/:userId1/:userId2", (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated())
    return res.status(401).json({ error: "Unauthorized" });
  deleteConversation(req, res, next);
});

module.exports = router;
