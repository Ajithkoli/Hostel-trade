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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
