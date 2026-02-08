import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ================= LOGIN =================
export const login = async (req, res) => {
  const { email, password, role } = req.body;

  let user;
  if (role === "admin") user = await Admin.findOne({ email });
  if (role === "doctor") user = await Doctor.findOne({ email });
  if (role === "patient") user = await Patient.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid password" });
  }

  res.json({
    token: generateToken(user),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

// ================= REGISTER (PATIENT) =================
export const registerPatient = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await Patient.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "Patient already exists" });
  }

  const patient = await Patient.create({
    name,
    email,
    password,
    role: "patient"
  });

  res.status(201).json({
    token: generateToken(patient),
    user: {
      _id: patient._id,
      name: patient.name,
      email: patient.email,
      role: patient.role
    }
  });
};
