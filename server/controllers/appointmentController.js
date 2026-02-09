import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import AuditLog from "../models/AuditLog.js";
import Patient from "../models/Patient.js";
import { createInAppNotification, sendEmail, sendSms } from "../utils/notificationService.js";

const toMinutes = (time) => {
  if (!time || typeof time !== "string" || !time.includes(":")) return null;
  const [h, m] = time.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
};

const rangesOverlap = (startA, endA, startB, endB) =>
  startA < endB && startB < endA;

const hasDoctorConflict = async ({
  doctorId,
  date,
  time,
  durationMinutes,
  excludeId,
}) => {
  if (!doctorId) return false;

  const start = toMinutes(time);
  if (start === null) return true;
  const duration = Number(durationMinutes) || 30;
  const end = start + duration;

  const existing = await Appointment.find({
    _id: { $ne: excludeId },
    doctorId,
    date,
    status: { $in: ["assigned", "approved"] },
  }).select("time durationMinutes");

  return existing.some((appt) => {
    const apptStart = toMinutes(appt.time);
    const apptDuration = Number(appt.durationMinutes) || 30;
    if (apptStart === null) return true;
    const apptEnd = apptStart + apptDuration;
    return rangesOverlap(start, end, apptStart, apptEnd);
  });
};

const hasPatientConflict = async ({
  patientId,
  date,
  time,
  durationMinutes,
  excludeId,
}) => {
  const start = toMinutes(time);
  if (start === null) return true;
  const duration = Number(durationMinutes) || 30;
  const end = start + duration;

  const existing = await Appointment.find({
    _id: { $ne: excludeId },
    patientId,
    date,
    status: { $in: ["pending", "assigned", "approved"] },
  }).select("time durationMinutes");

  return existing.some((appt) => {
    const apptStart = toMinutes(appt.time);
    const apptDuration = Number(appt.durationMinutes) || 30;
    if (apptStart === null) return true;
    const apptEnd = apptStart + apptDuration;
    return rangesOverlap(start, end, apptStart, apptEnd);
  });
};

const ensureDoctorAvailability = async ({
  doctorId,
  date,
  time,
  durationMinutes,
}) => {
  if (!doctorId) return { ok: true };

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return { ok: false, message: "Doctor not found" };

  const start = toMinutes(time);
  if (start === null) return { ok: false, message: "Invalid time format" };
  const duration = Number(durationMinutes) || doctor.slotDurationMinutes || 30;
  const end = start + duration;

  if (doctor.slotDurationMinutes && duration % doctor.slotDurationMinutes !== 0) {
    return {
      ok: false,
      message: `Duration must be in ${doctor.slotDurationMinutes}-minute increments`,
    };
  }

  if (doctor.availabilityDays?.length) {
    const day = new Date(date).getDay();
    if (!doctor.availabilityDays.includes(day)) {
      return { ok: false, message: "Doctor not available on this day" };
    }
  }

  if (doctor.availabilityStartTime && doctor.availabilityEndTime) {
    const startWindow = toMinutes(doctor.availabilityStartTime);
    const endWindow = toMinutes(doctor.availabilityEndTime);
    if (startWindow === null || endWindow === null) {
      return { ok: true };
    }
    if (start < startWindow || end > endWindow) {
      return { ok: false, message: "Time is outside doctor availability" };
    }
  }

  return { ok: true, doctor, duration };
};

const formatTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}`;
};

const buildAvailabilitySlots = async ({ doctor, date }) => {
  const start = toMinutes(doctor.availabilityStartTime);
  const end = toMinutes(doctor.availabilityEndTime);
  if (start === null || end === null || start >= end) return [];

  const day = new Date(date).getDay();
  if (doctor.availabilityDays?.length && !doctor.availabilityDays.includes(day)) {
    return [];
  }

  const slotDuration = doctor.slotDurationMinutes || 30;
  const appointments = await Appointment.find({
    doctorId: doctor._id,
    date,
    status: { $in: ["assigned", "approved"] },
  }).select("time durationMinutes");

  const isBooked = (slotStart, slotEnd) =>
    appointments.some((appt) => {
      const apptStart = toMinutes(appt.time);
      const apptDuration = Number(appt.durationMinutes) || 30;
      if (apptStart === null) return false;
      const apptEnd = apptStart + apptDuration;
      return rangesOverlap(slotStart, slotEnd, apptStart, apptEnd);
    });

  const slots = [];
  for (let t = start; t + slotDuration <= end; t += slotDuration) {
    const slotStart = t;
    const slotEnd = t + slotDuration;
    slots.push({
      time: formatTime(slotStart),
      booked: isBooked(slotStart, slotEnd),
    });
  }
  return slots;
};

const logAudit = async ({
  req,
  action,
  entityType,
  entityId,
  before,
  after,
  message,
}) => {
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
      entityType,
      entityId,
      before,
      after,
      message,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch {
    // best-effort audit logging
  }
};

/* ===================== PATIENT ===================== */

// patient creates appointment
export const createAppointment = async (req, res, next) => {
  try {
    const { date, time, reason, durationMinutes, doctorId } = req.body;
    if (!date || !time || !reason) {
      return res
        .status(400)
        .json({ message: "date, time, and reason are required" });
    }

    const patientConflict = await hasPatientConflict({
      patientId: req.user._id,
      date,
      time,
      durationMinutes,
    });
    if (patientConflict) {
      return res
        .status(409)
        .json({ message: "You already have an appointment at this time" });
    }

    if (doctorId) {
      const availability = await ensureDoctorAvailability({
        doctorId,
        date,
        time,
        durationMinutes: durationMinutes || 30,
      });
      if (!availability.ok) {
        return res.status(409).json({ message: availability.message });
      }
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId: doctorId || null,
      date,
      time,
      durationMinutes: durationMinutes || 30,
      reason,
      status: doctorId ? "assigned" : "pending",
    });

    await logAudit({
      req,
      action: "appointment.create",
      entityType: "appointment",
      entityId: appointment._id,
      after: {
        patientId: appointment.patientId,
        date: appointment.date,
        time: appointment.time,
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
      },
    });

    const patient = await Patient.findById(req.user._id).select("email name");
    await createInAppNotification({
      title: "Appointment Created",
      body: `Your appointment on ${date} at ${time} was created.`,
      user: req.user._id,
      role: "patient",
      meta: { appointmentId: appointment._id },
    });
    if (patient?.email) {
      await sendEmail({
        to: patient.email,
        subject: "Appointment Created",
        text: `Hello ${patient.name || ""}, your appointment on ${date} at ${time} was created.`,
      });
    }

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// patient views own appointments
export const getMyAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = { patientId: req.user._id };
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, appointments] = await Promise.all([
      Appointment.countDocuments(filter),
      Appointment.find(filter)
        .populate("doctorId", "name specialization")
        .skip(skip)
        .limit(limitNum),
    ]);

    res.json({ success: true, data: appointments, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

/* ===================== DOCTOR ===================== */

// doctor views assigned appointments
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = { doctorId: req.user._id };
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, appointments] = await Promise.all([
      Appointment.countDocuments(filter),
      Appointment.find(filter)
        .populate("patientId", "name email")
        .skip(skip)
        .limit(limitNum),
    ]);

    res.json({ success: true, data: appointments, total, page: pageNum, limit: limitNum });
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

    if (!appointment.doctorId) {
      return res
        .status(400)
        .json({ message: "Appointment has not been assigned to a doctor" });
    }

    if (String(appointment.doctorId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const availability = await ensureDoctorAvailability({
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time,
      durationMinutes: appointment.durationMinutes,
    });
    if (!availability.ok) {
      return res.status(409).json({ message: availability.message });
    }

    const conflict = await hasDoctorConflict({
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time,
      durationMinutes: appointment.durationMinutes,
      excludeId: appointment._id,
    });
    if (conflict) {
      return res
        .status(409)
        .json({ message: "Doctor is already booked for this time" });
    }

    const before = {
      status: appointment.status,
    };
    appointment.status = "approved";
    await appointment.save();

    await createInAppNotification({
      title: "Appointment Approved",
      body: `Your appointment on ${appointment.date} at ${appointment.time} was approved.`,
      user: appointment.patientId,
      role: "patient",
      meta: { appointmentId: appointment._id },
    });

    await logAudit({
      req,
      action: "appointment.approve",
      entityType: "appointment",
      entityId: appointment._id,
      before,
      after: { status: appointment.status },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// doctor rejects appointment
export const rejectAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (!appointment.doctorId) {
      return res
        .status(400)
        .json({ message: "Appointment has not been assigned to a doctor" });
    }

    if (String(appointment.doctorId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const before = {
      status: appointment.status,
    };
    appointment.status = "rejected";
    await appointment.save();

    await createInAppNotification({
      title: "Appointment Rejected",
      body: `Your appointment on ${appointment.date} at ${appointment.time} was rejected.`,
      user: appointment.patientId,
      role: "patient",
      meta: { appointmentId: appointment._id },
    });

    await logAudit({
      req,
      action: "appointment.reject",
      entityType: "appointment",
      entityId: appointment._id,
      before,
      after: { status: appointment.status },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* ===================== ADMIN ===================== */

// admin views all appointments
export const getAllAppointments = async (req, res, next) => {
  try {
    const { patient, doctor, status, date, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (patient) filter.patientId = patient;
    if (doctor) filter.doctorId = doctor;
    if (status) filter.status = status;
    if (date) filter.date = date;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, appointments] = await Promise.all([
      Appointment.countDocuments(filter),
      Appointment.find(filter)
        .populate("patientId", "name email")
        .populate("doctorId", "name specialization")
        .skip(skip)
        .limit(limitNum),
    ]);

    res.json({
      success: true,
      data: appointments,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    next(err);
  }
};

// admin assigns doctor
export const assignDoctor = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    const { doctorId } = req.body;
    if (!doctorId) {
      return res.status(400).json({ message: "doctorId is required" });
    }

    if (["rejected", "cancelled", "completed"].includes(appointment.status)) {
      return res
        .status(400)
        .json({ message: "Cannot assign a doctor to this appointment" });
    }

    const availability = await ensureDoctorAvailability({
      doctorId,
      date: appointment.date,
      time: appointment.time,
      durationMinutes: appointment.durationMinutes,
    });
    if (!availability.ok) {
      return res.status(409).json({ message: availability.message });
    }

    const conflict = await hasDoctorConflict({
      doctorId,
      date: appointment.date,
      time: appointment.time,
      durationMinutes: appointment.durationMinutes,
      excludeId: appointment._id,
    });
    if (conflict) {
      return res
        .status(409)
        .json({ message: "Doctor is already booked for this time" });
    }

    const before = {
      doctorId: appointment.doctorId,
      status: appointment.status,
    };

    appointment.doctorId = doctorId;
    appointment.status = "assigned";
    if (!appointment.durationMinutes) {
      appointment.durationMinutes = availability.duration || 30;
    }

    await appointment.save();

    await createInAppNotification({
      title: "Doctor Assigned",
      body: `A doctor has been assigned to your appointment on ${appointment.date} at ${appointment.time}.`,
      user: appointment.patientId,
      role: "patient",
      meta: { appointmentId: appointment._id },
    });

    await logAudit({
      req,
      action: "appointment.assign",
      entityType: "appointment",
      entityId: appointment._id,
      before,
      after: {
        doctorId: appointment.doctorId,
        status: appointment.status,
        durationMinutes: appointment.durationMinutes,
      },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* ===================== RESCHEDULE / CANCEL ===================== */

export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { date, time, durationMinutes } = req.body;
    if (!date || !time) {
      return res.status(400).json({ message: "date and time are required" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (
      req.user.role === "patient" &&
      String(appointment.patientId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (["rejected", "cancelled", "completed"].includes(appointment.status)) {
      return res
        .status(400)
        .json({ message: "Cannot reschedule this appointment" });
    }

    const patientConflict = await hasPatientConflict({
      patientId: appointment.patientId,
      date,
      time,
      durationMinutes: durationMinutes || appointment.durationMinutes,
      excludeId: appointment._id,
    });
    if (patientConflict) {
      return res
        .status(409)
        .json({ message: "Patient already has an appointment at this time" });
    }

    if (appointment.doctorId) {
      const availability = await ensureDoctorAvailability({
        doctorId: appointment.doctorId,
        date,
        time,
        durationMinutes: durationMinutes || appointment.durationMinutes,
      });
      if (!availability.ok) {
        return res.status(409).json({ message: availability.message });
      }

      const doctorConflict = await hasDoctorConflict({
        doctorId: appointment.doctorId,
        date,
        time,
        durationMinutes: durationMinutes || appointment.durationMinutes,
        excludeId: appointment._id,
      });
      if (doctorConflict) {
        return res
          .status(409)
          .json({ message: "Doctor is already booked for this time" });
      }
    }

    const before = {
      date: appointment.date,
      time: appointment.time,
      durationMinutes: appointment.durationMinutes,
      status: appointment.status,
    };

    appointment.date = date;
    appointment.time = time;
    if (durationMinutes) {
      appointment.durationMinutes = durationMinutes;
    }

    if (appointment.status === "approved") {
      appointment.status = "assigned";
    }

    await appointment.save();

    await createInAppNotification({
      title: "Appointment Rescheduled",
      body: `Your appointment was rescheduled to ${appointment.date} at ${appointment.time}.`,
      user: appointment.patientId,
      role: "patient",
      meta: { appointmentId: appointment._id },
    });

    await logAudit({
      req,
      action: "appointment.reschedule",
      entityType: "appointment",
      entityId: appointment._id,
      before,
      after: {
        date: appointment.date,
        time: appointment.time,
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
      },
    });
    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (
      req.user.role === "patient" &&
      String(appointment.patientId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (["completed", "cancelled"].includes(appointment.status)) {
      return res
        .status(400)
        .json({ message: "Appointment cannot be cancelled" });
    }

    const before = {
      status: appointment.status,
    };
    appointment.status = "cancelled";
    await appointment.save();

    await createInAppNotification({
      title: "Appointment Cancelled",
      body: `Your appointment on ${appointment.date} at ${appointment.time} was cancelled.`,
      user: appointment.patientId,
      role: "patient",
      meta: { appointmentId: appointment._id },
    });

    await logAudit({
      req,
      action: "appointment.cancel",
      entityType: "appointment",
      entityId: appointment._id,
      before,
      after: { status: appointment.status },
    });

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

/* ===================== AVAILABILITY ===================== */

export const getDoctorAvailability = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ message: "doctorId and date are required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const slots = await buildAvailabilitySlots({ doctor, date });
    res.json({ success: true, data: { slots } });
  } catch (err) {
    next(err);
  }
};
