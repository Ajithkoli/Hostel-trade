const express = require("express");
const {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getUserProducts
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");

const router = express.Router();

// Route to get products created by the logged-in user.
router.get("/myproducts", protect, getUserProducts);
// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected routes
router.post("/", protect, upload.array("images", 3), createProduct);
router.put("/:id", protect, upload.array("images", 3), updateProduct);
router.delete("/:id", protect, deleteProduct);



module.exports = router;
