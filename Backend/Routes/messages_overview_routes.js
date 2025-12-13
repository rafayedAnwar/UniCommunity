// Add a new route handler for GET /api/messages/conversations
// Returns a list of conversations for the current user, each with the other user's info and last message
const express = require('express');
const router = express.Router();
const Message = require('../Models/message_model');
const User = require('../Models/user_model');

// GET /api/messages/conversations
router.get('/conversations', async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const userId = req.user._id;
    // Find all conversations where the user is sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    }).sort({ createdAt: -1 });

    // Map of otherUserId => { lastMessage, otherUser }
    const convMap = {};
    for (const msg of messages) {
      const otherUserId = msg.sender.equals(userId) ? msg.recipient : msg.sender;
      if (!convMap[otherUserId]) {
        convMap[otherUserId] = { lastMessage: msg };
      }
    }
    // Fetch user info for all other users
    const otherUserIds = Object.keys(convMap);
    const users = await User.find({ _id: { $in: otherUserIds } });
    users.forEach(u => {
      convMap[u._id] = { ...convMap[u._id], otherUser: u };
    });
    // Return as array
    const conversations = Object.values(convMap).filter(c => c.otherUser);
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

module.exports = router;
