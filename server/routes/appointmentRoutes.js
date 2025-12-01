import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createAppointment, getAppointments, updateAppointment, deleteAppointment } from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/", protect, createAppointment);
router.get("/", protect, getAppointments);
router.put("/:id", protect, updateAppointment);
router.delete("/:id", protect, deleteAppointment);

export default router;
