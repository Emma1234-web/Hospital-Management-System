import Prescription from "../models/Prescription.js";
import AuditLog from "../models/AuditLog.js";
import { createInAppNotification } from "../utils/notificationService.js";

const logAudit = async ({ req, action, entityId, before, after }) => {
  try {
    const actorModel =
      req.user?.role === "admin"
        ? "Admin"
        : req.user?.role === "doctor"
        ? "Doctor"
        : req.user?.role === "patient"
        ? "Patient"
        : null;

    await AuditLog.create({
      actorId: req.user?._id || null,
      actorModel,
      action,
      entityType: "prescription",
      entityId,
      before,
      after,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch {
    // best effort
  }
};

export const createPrescription = async (req, res, next) => {
  try {
    const { patientId, medications, notes, refillsAllowed } = req.body;
    if (!patientId || !Array.isArray(medications) || medications.length === 0) {
      return res
        .status(400)
        .json({ message: "patientId and medications are required" });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: req.user._id,
      medications,
      notes,
      refillsAllowed: Number(refillsAllowed) || 0,
    });

    await createInAppNotification({
      title: "New Prescription",
      body: "A new prescription has been created for you.",
      user: patientId,
      role: "patient",
      meta: { prescriptionId: prescription._id },
    });

    await logAudit({
      req,
      action: "prescription.create",
      entityId: prescription._id,
      after: { patientId, doctorId: req.user._id },
    });

    res.status(201).json({ success: true, data: prescription });
  } catch (err) {
    next(err);
  }
};

export const getAllPrescriptions = async (req, res, next) => {
  try {
    const { status, patient, doctor, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (patient) filter.patientId = patient;
    if (doctor) filter.doctorId = doctor;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, prescriptions] = await Promise.all([
      Prescription.countDocuments(filter),
      Prescription.find(filter)
        .populate("patientId", "name email")
        .populate("doctorId", "name email")
        .skip(skip)
        .limit(limitNum),
    ]);
    res.json({ success: true, data: prescriptions, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

export const getDoctorPrescriptions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { doctorId: req.user._id };
    if (status) filter.status = status;
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, prescriptions] = await Promise.all([
      Prescription.countDocuments(filter),
      Prescription.find(filter)
        .populate("patientId", "name email")
        .populate("doctorId", "name email")
        .skip(skip)
        .limit(limitNum),
    ]);
    res.json({ success: true, data: prescriptions, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

export const getMyPrescriptions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { patientId: req.user._id };
    if (status) filter.status = status;
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, prescriptions] = await Promise.all([
      Prescription.countDocuments(filter),
      Prescription.find(filter)
        .populate("patientId", "name email")
        .populate("doctorId", "name email")
        .skip(skip)
        .limit(limitNum),
    ]);
    res.json({ success: true, data: prescriptions, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

export const refillPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    if (
      req.user.role === "patient" &&
      String(prescription.patientId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (prescription.refillsUsed >= prescription.refillsAllowed) {
      return res.status(400).json({ message: "No refills remaining" });
    }

    const before = { refillsUsed: prescription.refillsUsed };
    prescription.refillsUsed += 1;
    await prescription.save();

    await logAudit({
      req,
      action: "prescription.refill",
      entityId: prescription._id,
      before,
      after: { refillsUsed: prescription.refillsUsed },
    });

    res.json({ success: true, data: prescription });
  } catch (err) {
    next(err);
  }
};

export const updatePrescriptionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    const before = { status: prescription.status };
    prescription.status = status || prescription.status;
    await prescription.save();

    await logAudit({
      req,
      action: "prescription.update",
      entityId: prescription._id,
      before,
      after: { status: prescription.status },
    });

    res.json({ success: true, data: prescription });
  } catch (err) {
    next(err);
  }
};
