import express from "express";
import {
  sendAppointmentEmail,
  sendCustomEmail
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/appointment", sendAppointmentEmail);
router.post("/custom", sendCustomEmail);

export default router;
