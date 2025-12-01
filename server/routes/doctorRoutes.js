import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { getDoctorById, updateDoctor } from "../controllers/doctorController.js";

const router = express.Router();
router.get("/:id", protect, requireRole("doctor"), getDoctorById);
router.put("/:id", protect, requireRole("doctor"), updateDoctor);

export default router;
