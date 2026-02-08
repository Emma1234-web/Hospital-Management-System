import express from "express";
import {
  createRecord,
  getRecords,
} from "../controllers/medicalRecordController.js";

import { protect } from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/allowRoles.js";

const router = express.Router();

router.post("/", protect, allowRoles("doctor"), createRecord);
router.get("/", protect, allowRoles("doctor", "patient"), getRecords);

export default router;
