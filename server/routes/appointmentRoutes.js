import express from "express";
import {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  approveAppointment,
  rejectAppointment,
  getAllAppointments,
  assignDoctor,
} from "../controllers/appointmentController.js";

import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// patient
router.post("/", protect, allowRoles("patient"), createAppointment);
router.get("/mine", protect, allowRoles("patient"), getMyAppointments);

// doctor
router.get("/doctor", protect, allowRoles("doctor"), getDoctorAppointments);
router.patch("/:id/approve", protect, allowRoles("doctor"), approveAppointment);
router.patch("/:id/reject", protect, allowRoles("doctor"), rejectAppointment);

// admin
router.get("/", protect, allowRoles("admin"), getAllAppointments);
router.patch("/:id/assign", protect, allowRoles("admin"), assignDoctor);

export default router;
