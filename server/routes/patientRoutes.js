import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";

const router = express.Router();

// Create + Read Patients (admin only)
router.post("/", protect, requireRole("admin"), createPatient);
router.get("/", protect, requireRole("admin"), getPatients);

// Single patient
router.get("/:id", protect, getPatientById);
router.put("/:id", protect, requireRole("admin"), updatePatient);
router.delete("/:id", protect, requireRole("admin"), deletePatient);

export default router;
