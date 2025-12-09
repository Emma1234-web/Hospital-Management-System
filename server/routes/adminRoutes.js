// server/routes/adminRoutes.js
import express from "express";
import {
  getStats,
  listUsers,
  createDoctorByAdmin,
  createPatientByAdmin,
  deleteUserByAdmin,
  updateUserByAdmin,
} from "../controllers/adminController.js";

import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// all routes protected - admin only
router.use(protect, allowRoles("admin"));

// stats
router.get("/stats", getStats);

// manage users
router.get("/users", listUsers);
router.post("/create-doctor", createDoctorByAdmin);
router.post("/create-patient", createPatientByAdmin);
router.put("/user/:id", updateUserByAdmin);
router.delete("/user/:id", deleteUserByAdmin);

export default router;
