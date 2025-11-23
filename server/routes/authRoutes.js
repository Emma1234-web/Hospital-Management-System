import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// REGISTER ROUTE
router.post("/register", registerUser);

// LOGIN ROUTE
router.post("/login", loginUser);

export default router;
