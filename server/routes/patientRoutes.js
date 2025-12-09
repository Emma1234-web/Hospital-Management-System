import express from "express";
import {
  getPatients, getPatient, createPatient, updatePatient, deletePatient
} from "../controllers/patientController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/", protect, allowRoles("admin","doctor"), getPatients);
router.get("/:id", protect, allowRoles("admin","doctor","patient"), getPatient);
router.post("/", protect, allowRoles("admin"), createPatient);
router.put("/:id", protect, allowRoles("admin","doctor"), updatePatient);
router.delete("/:id", protect, allowRoles("admin"), deletePatient);
export default router;
