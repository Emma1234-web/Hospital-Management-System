import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { getPatientById, updatePatient } from "../controllers/patientController.js";

const router = express.Router();
router.get("/:id", protect, requireRole("patient"), getPatientById);
router.put("/:id", protect, requireRole("patient"), updatePatient);

export default router;
