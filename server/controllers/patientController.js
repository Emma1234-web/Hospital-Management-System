import Patient from "../models/Patient.js";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import Invoice from "../models/Invoice.js";
import Prescription from "../models/Prescription.js";
import LabResult from "../models/LabResult.js";
import Notification from "../models/Notification.js";

// CREATE (ADMIN)
export const createPatient = async (req, res, next) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
};

// READ ALL (ADMIN / DOCTOR)
export const getPatients = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const [patientsCollection, usersCollection] = await Promise.all([
      Patient.find(),
      User.find({ role: "patient" }),
    ]);

    const byEmail = new Map();
    for (const patient of patientsCollection) {
      if (patient.email) byEmail.set(patient.email, patient);
      else byEmail.set(String(patient._id), patient);
    }

    const merged = [...patientsCollection];
    for (const user of usersCollection) {
      const key = user.email || String(user._id);
      if (byEmail.has(key)) continue;
      merged.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        address: user.address,
        role: user.role,
        source: "user",
      });
    }

    let patients = merged;
    if (q) {
      const needle = q.toLowerCase();
      patients = patients.filter(
        (p) =>
          p.name?.toLowerCase().includes(needle) ||
          p.email?.toLowerCase().includes(needle)
      );
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const start = (pageNum - 1) * limitNum;
    const paged = patients.slice(start, start + limitNum);

    res.status(200).json({
      success: true,
      data: paged,
      total: patients.length,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    next(err);
  }
};

// READ ONE
export const getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    res.json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
};

// UPDATE
export const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
};

// DELETE
export const deletePatient = async (req, res, next) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// DASHBOARD STATS (PATIENT)
export const getPatientDashboardStats = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const [appointments, upcoming, unpaidInvoices, prescriptions, labResults, unreadNotifications] =
      await Promise.all([
        Appointment.countDocuments({ patientId }),
        Appointment.countDocuments({
          patientId,
          status: { $in: ["pending", "assigned", "approved"] },
        }),
        Invoice.countDocuments({ patientId, status: "unpaid" }),
        Prescription.countDocuments({ patientId }),
        LabResult.countDocuments({ patientId }),
        Notification.countDocuments({
          read: false,
          $or: [{ user: patientId }, { role: "patient" }],
        }),
      ]);

    res.json({
      success: true,
      data: {
        appointments,
        upcoming,
        unpaidInvoices,
        prescriptions,
        labResults,
        unreadNotifications,
      },
    });
  } catch (err) {
    next(err);
  }
};
