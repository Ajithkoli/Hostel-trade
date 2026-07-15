import express from "express";
import { getConversationMessages, getConversationsList, markConversationAsRead } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
import { handleValidationErrors } from "../middleware/validationMiddleware.js";
import { param } from "express-validator";

const router = express.Router();

// GET /api/chat/conversation/:conversationId
router.get(
  "/chat/conversation/:conversationId",
  protect,
  [
    param("conversationId").matches(/^[a-zA-Z0-9\-]+$/).withMessage("Invalid conversation ID format"),
    handleValidationErrors
  ],
  getConversationMessages
);

// GET /api/conversations/:userId
router.get(
  "/conversations/:userId",
  protect,
  [
    param("userId").isMongoId().withMessage("Invalid user identifier format"),
    handleValidationErrors
  ],
  getConversationsList
);

// PATCH /api/chat/conversation/:conversationId/read
router.patch(
  "/chat/conversation/:conversationId/read",
  protect,
  [
    param("conversationId").matches(/^[a-zA-Z0-9\-]+$/).withMessage("Invalid conversation ID format"),
    handleValidationErrors
  ],
  markConversationAsRead
);

export default router;
