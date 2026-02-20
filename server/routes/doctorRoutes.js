import express from "express";
import {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorDashboardStats,
} from "../controllers/doctorController.js";

import { protect } from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/allowRoles.js";

const router = express.Router();

router.use(protect);

router.post("/", allowRoles("admin"), createDoctor);
router.get("/dashboard-stats", allowRoles("doctor"), getDoctorDashboardStats);
router.get("/", allowRoles("admin", "patient", "doctor"), getDoctors);
router.get("/:id", allowRoles("admin", "patient", "doctor"), getDoctor);
router.put("/:id", allowRoles("admin"), updateDoctor);
router.delete("/:id", allowRoles("admin"), deleteDoctor);

export default router;
