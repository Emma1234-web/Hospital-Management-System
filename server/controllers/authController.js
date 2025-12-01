import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

const sign = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  const { name, email, password, role, ...rest } = req.body;
  try {
    if (role === "admin") return res.status(403).json({ message: "Admin cannot register via UI" });

    if (role === "doctor") {
      const exists = await Doctor.findOne({ email });
      if (exists) return res.status(400).json({ message: "Doctor email exists" });
      const doc = await Doctor.create({ name, email, password, ...rest });
      return res.status(201).json({ success: true, user: { id: doc._id, name: doc.name, email: doc.email, role: "doctor" } });
    }

    if (role === "patient") {
      const exists = await Patient.findOne({ email });
      if (exists) return res.status(400).json({ message: "Patient email exists" });
      const pat = await Patient.create({ name, email, password, ...rest });
      return res.status(201).json({ success: true, user: { id: pat._id, name: pat.name, email: pat.email, role: "patient" } });
    }

    return res.status(400).json({ message: "Invalid role" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const login = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    let account;
    if (role === "admin") account = await Admin.findOne({ email });
    if (role === "doctor") account = await Doctor.findOne({ email });
    if (role === "patient") account = await Patient.findOne({ email });
    if (!account) return res.status(400).json({ message: "Account not found" });
    const ok = await account.comparePassword(password);
    if (!ok) return res.status(400).json({ message: "Wrong password" });
    const token = sign(account._id, role);
    res.json({ success: true, token, user: { id: account._id, name: account.name, email: account.email, role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
