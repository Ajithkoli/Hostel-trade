const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  approveUser,
  rejectUser,
  updateUser,
  roleChange,
} = require("../controllers/adminController");

const { isAdmin, protect } = require("../middleware/authMiddleware");

router.use(protect); // user must be logged in
router.use(isAdmin); // and must be admin

router.get("/users", getAllUsers);
router.patch("/users/:id/verify", approveUser);
router.delete("/users/:id", rejectUser);
router.put("/users/:id", updateUser);

router.patch("/:id/make-admin", roleChange);

module.exports = router;
