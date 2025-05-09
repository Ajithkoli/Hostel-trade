// controllers/chatController.js
const ChatMessage = require("../models/ChatMessage");

// GET chat messages for a conversation
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("sender", "name email")
      .populate("receiver", "name email");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to load messages", error: err });
  }
};
