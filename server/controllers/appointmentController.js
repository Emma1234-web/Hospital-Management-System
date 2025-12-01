import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import { sendEmail } from "../utils/sendEmail.js";

export const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, date, time, reason } = req.body;
    const appt = await Appointment.create({ patient, doctor, date, time, reason });
    const pat = await Patient.findById(patient);
    const doc = await Doctor.findById(doctor);
    if (pat?.email) {
      const html = `<p>Hi ${pat.name}, your appointment with Dr. ${doc?.name || doc} on ${date} at ${time} is scheduled.</p>`;
      await sendEmail(pat.email, "Appointment Scheduled", html).catch(()=>{});
    }
    res.status(201).json({ success: true, appt });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getAppointments = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const query = Appointment.find().populate("patient", "name email").populate("doctor", "name specialization");
    const total = await Appointment.countDocuments();
    const appts = await query.skip((page-1)*limit).limit(limit).sort({createdAt:-1});
    res.json({ total, page, totalPages: Math.ceil(total/limit), data: appts });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(appt);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
