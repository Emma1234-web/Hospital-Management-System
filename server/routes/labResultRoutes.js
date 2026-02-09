import express from "express";
import {
  createLabResult,
  getAllLabResults,
  getDoctorLabResults,
  getMyLabResults,
} from "../controllers/labResultController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// create (admin/doctor)
router.post("/", protect, allowRoles("admin", "doctor"), createLabResult);

// read
router.get("/", protect, allowRoles("admin"), getAllLabResults);
router.get("/doctor", protect, allowRoles("doctor"), getDoctorLabResults);
router.get("/mine", protect, allowRoles("patient"), getMyLabResults);

export default router;
