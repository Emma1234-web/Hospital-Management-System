import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createRecord, getRecordsForPatient } from "../controllers/medicalRecordController.js";

const router = express.Router();

router.post("/", protect, createRecord);
router.get("/patient/:patientId", protect, getRecordsForPatient);

export default router;
