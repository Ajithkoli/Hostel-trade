import ChatMessage from "../models/ChatMessage.js";

// GET chat messages for a conversation
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("sender", "name email")
      .populate("receiver", "name email");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to load messages", error: err.message });
  }
};

// GET all conversations involving the logged-in user
export const getConversationsList = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages where current user is sender or receiver
    const messages = await ChatMessage.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
    .populate("sender", "name email")
    .populate("receiver", "name email")
    .sort({ createdAt: -1 });

    const conversationsMap = {};

    for (const msg of messages) {
      const cid = msg.conversationId;
      if (!conversationsMap[cid] && msg.sender && msg.receiver) {
        const otherUser = msg.sender._id.equals(userId) ? msg.receiver : msg.sender;
        conversationsMap[cid] = {
          _id: cid,
          participants: [
            { _id: req.user._id, name: req.user.name, email: req.user.email },
            { _id: otherUser._id, name: otherUser.name, email: otherUser.email }
          ],
          unreadCount: 0
        };
      }
    }

    res.json(Object.values(conversationsMap));
  } catch (err) {
    res.status(500).json({ message: "Failed to load conversations", error: err.message });
  }
};

// MARK all messages in a conversation as read
// @route   PATCH /api/chat/conversation/:conversationId/read
// @access  Private
export const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await ChatMessage.updateMany(
      { conversationId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, message: "Conversation marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark messages as read", error: err.message });
  }
};
