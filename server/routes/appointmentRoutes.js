import express from "express";
import {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  approveAppointment,
  rejectAppointment,
  getAllAppointments,
  assignDoctor,
  rescheduleAppointment,
  cancelAppointment,
  getDoctorAvailability,
} from "../controllers/appointmentController.js";

import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// patient
router.post("/", protect, allowRoles("patient"), createAppointment);
router.get("/mine", protect, allowRoles("patient"), getMyAppointments);
router.get("/availability", protect, allowRoles("patient"), getDoctorAvailability);
router.patch(
  "/:id/reschedule",
  protect,
  allowRoles("patient", "admin"),
  rescheduleAppointment
);
router.patch(
  "/:id/cancel",
  protect,
  allowRoles("patient", "admin"),
  cancelAppointment
);

// doctor
router.get("/doctor", protect, allowRoles("doctor"), getDoctorAppointments);
router.patch("/:id/approve", protect, allowRoles("doctor"), approveAppointment);
router.patch("/:id/reject", protect, allowRoles("doctor"), rejectAppointment);

// admin
router.get("/", protect, allowRoles("admin"), getAllAppointments);
router.patch("/:id/assign", protect, allowRoles("admin"), assignDoctor);

export default router;
