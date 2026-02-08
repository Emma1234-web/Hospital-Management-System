import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";


export const createAdmin = async (req, res) => {
  const admin = await Admin.create(req.body);
  res.status(201).json(admin);
};

export const getStats = async (req, res) => {
  const stats = {
    patients: await Patient.countDocuments(),
    doctors: await Doctor.countDocuments(),
    appointments: await Appointment.countDocuments(),
    pendingAppointments: await Appointment.countDocuments({ status:"pending" })
  };
  res.json(stats);
};
