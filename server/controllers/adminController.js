// server/controllers/adminController.js
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import MedicalRecord from "../models/MedicalRecord.js";
import bcrypt from "bcryptjs";

/**
 * Admin controller - admin-only operations
 */

/**
 * GET /api/admin/stats
 * returns basic dashboard stats
 */
export const getStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const doctorsCount = await Doctor.countDocuments();
    const patientsCount = await Patient.countDocuments();
    const appointmentsCount = await Appointment.countDocuments();
    const recordsCount = await MedicalRecord.countDocuments();

    res.json({
      success: true,
      data: {
        users: usersCount,
        doctors: doctorsCount,
        patients: patientsCount,
        appointments: appointmentsCount,
        medicalRecords: recordsCount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/users
 * list all users (doctors & patients & admins)
 */
export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/admin/create-doctor
 * admin creates a doctor (and corresponding User row)
 * body: { name, email, password, phone, specialization, experience }
 */
export const createDoctorByAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, experience } = req.body;

    // ensure no existing user/doctor with same email
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "Email already in use" });

    // create User with role doctor
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hash, role: "doctor" });

    // create Doctor profile
    const doc = await Doctor.create({
      name,
      email,
      phone,
      specialization,
      experience: experience || 0,
    });

    res.status(201).json({ success: true, data: { user, doctor: doc } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/admin/create-patient
 * admin creates a patient (and corresponding User row)
 * body: { name, email, password, age, gender, phone, address }
 */
export const createPatientByAdmin = async (req, res) => {
  try {
    const { name, email, password, age, gender, phone, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "Email already in use" });

    // create User with role patient
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hash, role: "patient" });

    // create Patient profile
    const pat = await Patient.create({
      name,
      email,
      phone,
      age,
      gender,
      address,
    });

    res.status(201).json({ success: true, data: { user, patient: pat } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/admin/user/:id
 * delete a user (and optionally the doctor/patient profile if exists)
 */
export const deleteUserByAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // try to delete doctor/patient profile with the same email (best-effort)
    try {
      await Doctor.findOneAndDelete({ email: user.email });
      await Patient.findOneAndDelete({ email: user.email });
    } catch (e) {
      // silent
    }

    res.json({ success: true, message: "User removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/admin/user/:id
 * update user basic info (admin-controlled)
 */
export const updateUserByAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;

    // if password update requested, hash it
    if (payload.password) {
      const salt = await bcrypt.genSalt(10);
      payload.password = await bcrypt.hash(payload.password, salt);
    }

    const user = await User.findByIdAndUpdate(id, payload, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // update doctor/patient profiles if present (best-effort by email)
    // optional: update by role-specific id if available in request
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
