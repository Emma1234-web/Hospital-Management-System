import express from "express";
import {
  getNotifications,
  markAsRead,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/allowRoles.js";

const router = express.Router();

router.get("/", protect, allowRoles("admin", "doctor", "patient"), getNotifications);
router.patch("/:id/read", protect, markAsRead);

export default router;
