import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from "../controllers/appointmentController.js";

const router = express.Router();

router.get("/", protect, allowRoles("admin", "doctor", "patient"), getAppointments);
router.get("/:id", protect, allowRoles("admin", "doctor", "patient"), getAppointment);
router.post("/", protect, allowRoles("admin", "doctor"), createAppointment);
router.put("/:id", protect, allowRoles("admin", "doctor"), updateAppointment);
router.delete("/:id", protect, allowRoles("admin"), deleteAppointment);

export default router;
