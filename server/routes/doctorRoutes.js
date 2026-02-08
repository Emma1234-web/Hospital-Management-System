import express from "express";
import {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctorController.js";

import { protect } from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/allowRoles.js";

const router = express.Router();

router.use(protect);

router.post("/", allowRoles("admin"), createDoctor);
router.get("/", allowRoles("admin"), getDoctors);
router.get("/:id", allowRoles("admin"), getDoctor);
router.put("/:id", allowRoles("admin"), updateDoctor);
router.delete("/:id", allowRoles("admin"), deleteDoctor);

export default router;
