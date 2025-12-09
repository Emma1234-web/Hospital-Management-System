// server/routes/notificationRoutes.js
import express from "express";
import {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// protected routes
router.use(protect);

// create - admin or system
router.post("/", allowRoles("admin"), createNotification);

// list - admin lists all; others get their own role/user notifications
router.get("/", getNotifications);

// mark as read - user or admin
router.put("/:id/read", markAsRead);

// delete - admin
router.delete("/:id", allowRoles("admin"), deleteNotification);

export default router;
