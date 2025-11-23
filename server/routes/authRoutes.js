import express from "express";
import { register, login } from "../controllers/authController.js";
import { adminLogin } from "../controllers/adminController.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);
export default router;
