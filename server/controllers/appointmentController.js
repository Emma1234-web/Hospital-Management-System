import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

export const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, date, time, reason } = req.body;
    // optional: ensure patient and doctor exist
    const p = await Patient.findById(patient);
    const d = await Doctor.findById(doctor);
    if (!p || !d) return res.status(400).json({ message: "Invalid patient or doctor" });

    const a = await Appointment.create({ patient, doctor, date, time, reason });
    res.status(201).json({ success: true, data: a });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getAppointments = async (req, res) => {
  try {
    const filter = {};
    // query params optional: ?doctor=... ?patient=...
    if (req.query.doctor) filter.doctor = req.query.doctor;
    if (req.query.patient) filter.patient = req.query.patient;

    // restrict by role if needed
    if (req.user.role === "doctor") filter.doctor = req.user.id;
    if (req.user.role === "patient") filter.patient = req.user.id;

    const list = await Appointment.find(filter)
      .populate("patient", "name email")
      .populate("doctor", "name specialization")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: list });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getAppointment = async (req, res) => {
  try {
    const a = await Appointment.findById(req.params.id)
      .populate("patient", "name email")
      .populate("doctor", "name specialization");
    if (!a) return res.status(404).json({ success: false, message: "Not found" });

    // restrict patient/doctor seeing others
    if (req.user.role === "patient" && a.patient._id.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Access denied" });
    if (req.user.role === "doctor" && a.doctor._id.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Access denied" });

    res.json({ success: true, data: a });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const updateAppointment = async (req, res) => {
  try {
    const a = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!a) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: a });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const deleteAppointment = async (req, res) => {
  try {
    const a = await Appointment.findByIdAndDelete(req.params.id);
    if (!a) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
