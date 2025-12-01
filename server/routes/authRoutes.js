import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();
router.post("/register", register); // for doctor & patient only
router.post("/login", login);
export default router;
