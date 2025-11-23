import express from "express";
import { createRecord, getRecords } from "../controllers/medicalRecordController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/", protect, getRecords);
router.post("/", protect, createRecord);
export default router;
