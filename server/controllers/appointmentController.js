import Appointment from "../models/Appointment.js";

/* ===================== PATIENT ===================== */

// patient creates appointment
export const createAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.create({
      patientId: req.user._id,
      date: req.body.date,
      time: req.body.time,
      reason: req.body.reason,
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// patient views own appointments
export const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.user._id,
    }).populate("doctorId", "name specialization");

    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

/* ===================== DOCTOR ===================== */

// doctor views assigned appointments
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({
      doctorId: req.user._id,
    }).populate("patientId", "name email");

    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

// doctor approves appointment
export const approveAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "approved";
    await appointment.save();

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// doctor rejects appointment
export const rejectAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    appointment.status = "rejected";
    await appointment.save();

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* ===================== ADMIN ===================== */

// admin views all appointments
export const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId", "name email")
      .populate("doctorId", "name specialization");

    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

// admin assigns doctor
export const assignDoctor = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    appointment.doctorId = req.body.doctorId;
    appointment.status = "assigned";

    await appointment.save();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
