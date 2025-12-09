import express from "express";
import {
  getMedicalRecords, getMedicalRecord, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord
} from "../controllers/medicalRecordController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/", protect, allowRoles("admin","doctor","patient"), getMedicalRecords);
router.get("/:id", protect, allowRoles("admin","doctor","patient"), getMedicalRecord);
router.post("/", protect, allowRoles("admin","doctor"), createMedicalRecord);
router.put("/:id", protect, allowRoles("admin","doctor"), updateMedicalRecord);
router.delete("/:id", protect, allowRoles("admin"), deleteMedicalRecord);
export default router;
