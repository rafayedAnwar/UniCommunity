const Message = require("../Models/message_model");
const User = require("../Models/user_model");

// Send a direct message
const sendMessage = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const { senderId, content } = req.body;
    if (!content || !senderId) {
      return res.status(400).json({ error: "Missing sender or content" });
    }
    if (senderId === recipientId) {
      return res.status(400).json({ error: "Cannot message yourself" });
    }
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }
    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content,
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get conversation between two users (sorted by time)
const getConversation = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId1, recipient: userId2 },
        { sender: userId2, recipient: userId1 },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all conversations for a user (list of unique users messaged with)
const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    // Find all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    }).sort({ createdAt: -1 });
    // Get unique user IDs
    const users = new Set();
    messages.forEach((msg) => {
      if (msg.sender.toString() !== userId) users.add(msg.sender.toString());
      if (msg.recipient.toString() !== userId)
        users.add(msg.recipient.toString());
    });
    res.status(200).json(Array.from(users));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a specific message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findByIdAndDelete(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete entire conversation between two users
const deleteConversation = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const result = await Message.deleteMany({
      $or: [
        { sender: userId1, recipient: userId2 },
        { sender: userId2, recipient: userId1 },
      ],
    });
    res
      .status(200)
      .json({ message: `Deleted ${result.deletedCount} messages` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getUserConversations,
  deleteMessage,
  deleteConversation,
};
