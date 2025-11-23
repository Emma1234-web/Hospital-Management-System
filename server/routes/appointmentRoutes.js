import express from "express";
import {
  createAppointment,
  getAppointments,
  updateAppointment,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/", createAppointment);
router.get("/", getAppointments);
router.put("/:id", updateAppointment);;

export default router;
