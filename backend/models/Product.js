import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Books", "Electrical", "Vehicles", "Miscellaneous"],
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      // Changed field name to images (an array)
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
    },
    intent: {
      type: String,
      enum: ["Rent", "Buy"],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Available", "Sold"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to speed up marketplace filters, sorting, and details retrieval
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ user: 1 });
productSchema.index({ createdAt: -1 });

// Full-text index for search queries
productSchema.index({ name: "text", description: "text" });


export default mongoose.model("Product", productSchema);
