import express from "express";
import {
  createPatient, getPatients, getSinglePatient, updatePatient, deletePatient
} from "../controllers/patientController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, getPatients);
router.post("/", protect, requireRole("admin"), createPatient);
router.get("/:id", protect, getSinglePatient);
router.put("/:id", protect, requireRole("admin"), updatePatient);
router.delete("/:id", protect, requireRole("admin"), deletePatient);
export default router;
