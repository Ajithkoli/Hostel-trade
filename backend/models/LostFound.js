import mongoose from "mongoose";

const lostFoundSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["Lost", "Found"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Electronics",
        "Books",
        "Documents",
        "Keys",
        "Clothing",
        "Accessories",
        "Miscellaneous",
      ],
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    hostel: {
      type: String,
      required: [true, "Hostel is required"],
    },
    dateLostOrFound: {
      type: Date,
      required: [true, "Date is required"],
    },
    contactPreference: {
      type: String,
      required: true,
      enum: ["Chat", "Email", "Phone"],
      default: "Chat",
    },
    reward: {
      type: Number,
      min: [0, "Reward cannot be negative"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Open", "Claimed", "Closed"],
      default: "Open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to speed up lost & found filters, sorting, and user-profile retrieval
lostFoundSchema.index({ category: 1 });
lostFoundSchema.index({ hostel: 1 });
lostFoundSchema.index({ type: 1 });
lostFoundSchema.index({ status: 1 });
lostFoundSchema.index({ createdAt: -1 });

export default mongoose.model("LostFound", lostFoundSchema);
