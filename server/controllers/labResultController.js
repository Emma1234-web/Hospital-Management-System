import LabResult from "../models/LabResult.js";
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
      entityType: "labResult",
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

export const createLabResult = async (req, res, next) => {
  try {
    const {
      patientId,
      doctorId,
      testName,
      resultText,
      resultFileName,
      resultFileType,
      resultFileData,
      status,
    } = req.body;

    if (!patientId || !testName) {
      return res.status(400).json({ message: "patientId and testName required" });
    }

    const resolvedDoctorId =
      req.user.role === "doctor" ? req.user._id : doctorId || null;

    const lab = await LabResult.create({
      patientId,
      doctorId: resolvedDoctorId,
      testName,
      resultText: resultText || "",
      resultFileName: resultFileName || "",
      resultFileType: resultFileType || "",
      resultFileData: resultFileData || "",
      status: status || "completed",
    });

    await createInAppNotification({
      title: "Lab Result Available",
      body: `Your lab result for ${testName} is available.`,
      user: patientId,
      role: "patient",
      meta: { labResultId: lab._id },
    });

    await logAudit({
      req,
      action: "lab.create",
      entityId: lab._id,
      after: { patientId, testName },
    });

    res.status(201).json({ success: true, data: lab });
  } catch (err) {
    next(err);
  }
};

export const getAllLabResults = async (req, res, next) => {
  try {
    const { status, patient, doctor, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (patient) filter.patientId = patient;
    if (doctor) filter.doctorId = doctor;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, labs] = await Promise.all([
      LabResult.countDocuments(filter),
      LabResult.find(filter)
        .populate("patientId", "name email")
        .populate("doctorId", "name email")
        .skip(skip)
        .limit(limitNum),
    ]);
    res.json({ success: true, data: labs, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

export const getDoctorLabResults = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { doctorId: req.user._id };
    if (status) filter.status = status;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, labs] = await Promise.all([
      LabResult.countDocuments(filter),
      LabResult.find(filter)
        .populate("patientId", "name email")
        .populate("doctorId", "name email")
        .skip(skip)
        .limit(limitNum),
    ]);
    res.json({ success: true, data: labs, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

export const getMyLabResults = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { patientId: req.user._id };
    if (status) filter.status = status;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, labs] = await Promise.all([
      LabResult.countDocuments(filter),
      LabResult.find(filter)
        .populate("patientId", "name email")
        .populate("doctorId", "name email")
        .skip(skip)
        .limit(limitNum),
    ]);
    res.json({ success: true, data: labs, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};
