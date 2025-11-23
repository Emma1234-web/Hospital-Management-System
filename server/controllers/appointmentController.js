import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import { sendEmail } from "../utils/sendEmail.js";

/* ================================
   CREATE APPOINTMENT
================================ */
export const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, date, time, reason } = req.body;

    const newAppointment = await Appointment.create({
      patient,
      doctor,
      date,
      time,
      reason,
    });

    // Fetch patient + doctor details
    const patientInfo = await Patient.findById(patient);
    const doctorInfo = await Doctor.findById(doctor);

    const emailTemplate = `
      <h2>Appointment Confirmation</h2>
      <p>Hello <strong>${patientInfo.name}</strong>,</p>
      <p>Your appointment has been booked successfully.</p>

      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Doctor:</strong> Dr. ${doctorInfo.name}</p>
    `;

    await sendEmail(
      patientInfo.email,
      "Your Appointment is Confirmed",
      emailTemplate
    );

    res.status(201).json({
      success: true,
      message: "Appointment created & email sent",
      newAppointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================
   GET ALL APPOINTMENTS
================================ */
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient")
      .populate("doctor");

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================
   GET SINGLE APPOINTMENT
================================ */
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient")
      .populate("doctor");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================
   UPDATE APPOINTMENT
================================ */
export const updateAppointment = async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({ success: true, updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================
   DELETE APPOINTMENT
================================ */
export const deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Appointment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
