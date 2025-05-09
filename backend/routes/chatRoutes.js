// routes/chatRoutes.js
const express = require("express");
const { getConversationMessages } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/chat/conversation/:conversationId
router.get("/conversation/:conversationId", protect, getConversationMessages);

module.exports = router;
