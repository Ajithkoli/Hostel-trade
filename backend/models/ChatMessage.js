// models/ChatMessage.js
import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    conversationId: { 
      type: String, 
      required: true 
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index to optimize reading conversation histories
chatMessageSchema.index({ conversationId: 1 });
chatMessageSchema.index({ sender: 1, receiver: 1 });


export default mongoose.model("ChatMessage", chatMessageSchema);
