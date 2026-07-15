import express from "express";
import {
  getAllLostFound,
  getLostFoundById,
  createLostFound,
  updateLostFound,
  deleteLostFound,
  getUserLostFound,
} from "../controllers/lostFoundController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import { lostFoundValidator, paramIdValidator } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Public endpoints
router.get("/", getAllLostFound);
router.get("/myposts", protect, getUserLostFound);
router.get("/:id", paramIdValidator, getLostFoundById);

// Protected endpoints
router.post("/", protect, upload.array("images", 3), lostFoundValidator, createLostFound);
router.put("/:id", protect, paramIdValidator, upload.array("images", 3), lostFoundValidator, updateLostFound);
router.delete("/:id", protect, paramIdValidator, deleteLostFound);

export default router;
