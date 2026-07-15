import express from "express";
import {
  getAllUsers,
  approveUser,
  rejectUser,
  updateUser,
  roleChange,
} from "../controllers/adminController.js";
import { isAdmin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // user must be logged in
router.use(isAdmin); // and must be admin

router.get("/", getAllUsers);
router.patch("/:id/verify", approveUser);
router.delete("/:id", rejectUser);
router.put("/:id", updateUser);
router.patch("/:id/make-admin", roleChange);

export default router;
