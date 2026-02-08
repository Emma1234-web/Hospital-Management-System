import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/allowRoles.js";

const router = express.Router();

router.get("/dashboard", protect, allowRoles("admin"), (req, res) => {
  res.json({ success: true, admin: req.user });
});

export default router;
