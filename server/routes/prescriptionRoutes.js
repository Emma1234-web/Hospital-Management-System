import express from "express";
import {
  createPrescription,
  getAllPrescriptions,
  getDoctorPrescriptions,
  getMyPrescriptions,
  refillPrescription,
  updatePrescriptionStatus,
} from "../controllers/prescriptionController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// doctor
router.post("/", protect, allowRoles("doctor"), createPrescription);
router.get("/doctor", protect, allowRoles("doctor"), getDoctorPrescriptions);
router.patch("/:id/status", protect, allowRoles("doctor", "admin"), updatePrescriptionStatus);

// patient
router.get("/mine", protect, allowRoles("patient"), getMyPrescriptions);
router.patch("/:id/refill", protect, allowRoles("patient"), refillPrescription);

// admin
router.get("/", protect, allowRoles("admin"), getAllPrescriptions);

export default router;
