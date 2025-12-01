import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
  createDoctor, createPatient, getAllDoctors, getAllPatients, deleteDoctor, deletePatient
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, requireRole("admin"));

router.post("/create-doctor", createDoctor);
router.post("/create-patient", createPatient);
router.get("/doctors", getAllDoctors);
router.get("/patients", getAllPatients);
router.delete("/doctor/:id", deleteDoctor);
router.delete("/patient/:id", deletePatient);

export default router;
