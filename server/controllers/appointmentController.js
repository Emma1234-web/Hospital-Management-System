import Appointment from "../models/Appointment.js";

const hasDoctorConflict = async ({ doctorId, date, time, excludeId }) => {
  if (!doctorId) return false;

  const conflict = await Appointment.findOne({
    _id: { $ne: excludeId },
    doctorId,
    date,
    time,
    status: { $in: ["assigned", "approved"] },
  }).select("_id");

  return Boolean(conflict);
};

const hasPatientConflict = async ({ patientId, date, time, excludeId }) => {
  const conflict = await Appointment.findOne({
    _id: { $ne: excludeId },
    patientId,
    date,
    time,
    status: { $in: ["pending", "assigned", "approved"] },
  }).select("_id");

  return Boolean(conflict);
};

/* ===================== PATIENT ===================== */

// patient creates appointment
export const createAppointment = async (req, res, next) => {
  try {
    const { date, time, reason } = req.body;
    if (!date || !time || !reason) {
      return res
        .status(400)
        .json({ message: "date, time, and reason are required" });
    }

    const patientConflict = await hasPatientConflict({
      patientId: req.user._id,
      date,
      time,
    });
    if (patientConflict) {
      return res
        .status(409)
        .json({ message: "You already have an appointment at this time" });
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      date,
      time,
      reason,
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

    if (!appointment.doctorId) {
      return res
        .status(400)
        .json({ message: "Appointment has not been assigned to a doctor" });
    }

    if (String(appointment.doctorId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const conflict = await hasDoctorConflict({
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time,
      excludeId: appointment._id,
    });
    if (conflict) {
      return res
        .status(409)
        .json({ message: "Doctor is already booked for this time" });
    }

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

    const conflict = await hasDoctorConflict({
      doctorId,
      date: appointment.date,
      time: appointment.time,
      excludeId: appointment._id,
    });
    if (conflict) {
      return res
        .status(409)
        .json({ message: "Doctor is already booked for this time" });
    }

    appointment.doctorId = doctorId;
    appointment.status = "assigned";

    await appointment.save();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* ===================== RESCHEDULE / CANCEL ===================== */

export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { date, time } = req.body;
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
      excludeId: appointment._id,
    });
    if (patientConflict) {
      return res
        .status(409)
        .json({ message: "Patient already has an appointment at this time" });
    }

    if (appointment.doctorId) {
      const doctorConflict = await hasDoctorConflict({
        doctorId: appointment.doctorId,
        date,
        time,
        excludeId: appointment._id,
      });
      if (doctorConflict) {
        return res
          .status(409)
          .json({ message: "Doctor is already booked for this time" });
      }
    }

    appointment.date = date;
    appointment.time = time;

    if (appointment.status === "approved") {
      appointment.status = "assigned";
    }

    await appointment.save();
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

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};
