import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import { paginate } from "../utils/paginate.js";
import { sendEmail } from "../utils/sendEmail.js";

export const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, date, time, reason } = req.body;
    const newApp = await Appointment.create({ patient, doctor, date, time, reason, createdBy: req.user._id });

    // send confirmation email (non-blocking)
    try {
      const p = await Patient.findById(patient);
      const d = await Doctor.findById(doctor);
      if (p?.email) {
        const html = `<p>Hello ${p.name}, your appointment with Dr. ${d?.name} on ${date} at ${time} is confirmed.</p>`;
        await sendEmail(p.email, "Appointment Confirmation", html);
      }
    } catch (e) { console.error("Email error:", e); }

    res.status(201).json({ success: true, appointment: newApp });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await paginate(Appointment, {}, Number(page), Number(limit), "patient doctor");
    res.json(result);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getSingleAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate("patient doctor");
    if (!appointment) return res.status(404).json({ message: "Not found" });
    res.json({ success: true, appointment });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateAppointment = async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, appointment: updated });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
