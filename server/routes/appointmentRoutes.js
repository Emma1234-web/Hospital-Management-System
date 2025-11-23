import express from "express";
import {
  createAppointment, getAppointments, getSingleAppointment, updateAppointment, deleteAppointment
} from "../controllers/appointmentController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, getAppointments);
router.post("/", protect, createAppointment); // patients/doctors create through frontend
router.get("/:id", protect, getSingleAppointment);
router.put("/:id", protect, updateAppointment);
router.delete("/:id", protect, requireRole("admin"), deleteAppointment);
export default router;
