import express from "express";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", verifyAdmin, (req, res) => {
  res.json({ message: "Admin dashboard accessed successfully" });
});

router.post("/create", verifyAdmin, (req, res) => {
  res.json({ message: "Admin created successfully" });
});

export default router;
