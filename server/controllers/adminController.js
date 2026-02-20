import Admin from "../models/Admin.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Invoice from "../models/Invoice.js";
import Prescription from "../models/Prescription.js";
import LabResult from "../models/LabResult.js";
import Notification from "../models/Notification.js";


export const createAdmin = async (req, res) => {
  const admin = await Admin.create(req.body);
  res.status(201).json(admin);
};

export const getStats = async (req, res) => {
  const stats = {
    patients: await Patient.countDocuments(),
    doctors: await Doctor.countDocuments(),
    appointments: await Appointment.countDocuments(),
    pendingAppointments: await Appointment.countDocuments({ status: "pending" }),
    invoices: await Invoice.countDocuments(),
    unpaidInvoices: await Invoice.countDocuments({ status: "unpaid" }),
    prescriptions: await Prescription.countDocuments(),
    labResults: await LabResult.countDocuments(),
    unreadNotifications: await Notification.countDocuments({
      read: false,
      $or: [{ role: "admin" }, { role: null }],
    }),
  };
  res.json({ success: true, data: stats });
};
