import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor
} from "../controllers/doctorController.js";

const router = express.Router();

router.get("/", protect, allowRoles("admin"), getDoctors);
router.get("/:id", protect, allowRoles("admin","doctor"), getDoctor);
router.post("/", protect, allowRoles("admin"), createDoctor);
router.put("/:id", protect, allowRoles("admin","doctor"), updateDoctor);
router.delete("/:id", protect, allowRoles("admin"), deleteDoctor);

export default router;
