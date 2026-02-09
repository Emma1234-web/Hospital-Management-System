import express from "express";
import { getAuditLogs } from "../controllers/auditLogController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, allowRoles("admin"), getAuditLogs);

export default router;
