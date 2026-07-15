import express from "express";
import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getUserProducts,
  updateProductStatus,
  renewProduct,
  reportProduct
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import { productValidator, paramIdValidator } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Route to get products created by the logged-in user.
router.get("/myproducts", protect, getUserProducts);

// Public routes
router.get("/", getAllProducts);
router.get("/:id", paramIdValidator, getProductById);

// Protected routes
router.post("/", protect, upload.array("images", 3), productValidator, createProduct);
router.put("/:id", protect, paramIdValidator, upload.array("images", 3), productValidator, updateProduct);
router.delete("/:id", protect, paramIdValidator, deleteProduct);

// Listing lifecycle & moderation routes
router.patch("/:id/status", protect, paramIdValidator, updateProductStatus);
router.post("/:id/renew", protect, paramIdValidator, renewProduct);
router.post("/:id/report", protect, paramIdValidator, reportProduct);

export default router;
