import express from "express";
import { sendAppointmentEmail } from "../controllers/notificationController.js";
const router = express.Router();
router.post("/appointment", sendAppointmentEmail);
export default router;
