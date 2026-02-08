import express from "express";
import {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";

import { protect } from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/allowRoles.js";

const router = express.Router();

router.use(protect);

router.post("/", allowRoles("admin"), createPatient);
router.get("/", allowRoles("admin", "doctor"), getPatients);
router.get("/:id", getPatient);
router.put("/:id", allowRoles("admin"), updatePatient);
router.delete("/:id", allowRoles("admin"), deletePatient);

export default router;
