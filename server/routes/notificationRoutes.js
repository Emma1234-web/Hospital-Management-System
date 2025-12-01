import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createNotification, getNotifications } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/", protect, createNotification);
router.get("/", protect, getNotifications);

export default router;
