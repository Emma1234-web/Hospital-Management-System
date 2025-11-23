import express from "express";
import {
  createDoctor, getDoctors, getSingleDoctor, updateDoctor, deleteDoctor
} from "../controllers/doctorController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, getDoctors);
router.post("/", protect, requireRole("admin"), createDoctor);
router.get("/:id", protect, getSingleDoctor);
router.put("/:id", protect, requireRole("admin"), updateDoctor);
router.delete("/:id", protect, requireRole("admin"), deleteDoctor);
export default router;
