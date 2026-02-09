// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import labResultRoutes from "./routes/labResultRoutes.js";
import errorHandler from "./middleware/errorHandler.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// connect to DB
connectDB();

// middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// mount API routes (all under /api)
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/notify", notificationRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/lab-results", labResultRoutes);

// health
app.get("/", (_req, res) => res.send("Hospital Backend is running"));

// error handler (last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
