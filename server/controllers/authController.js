import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  try {
    const { name, email, password, role, secret, ...rest } = req.body;

    if (!role) return res.status(400).json({ message: "Role is required" });

    if (role === "admin") {
      // secret must match
      if (secret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: "Invalid admin secret" });
      }

      const exists = await Admin.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "Admin email already used" });
      }

      const admin = await Admin.create({ name, email, password });

      return res.status(201).json({
        user: admin,
        token: signToken(admin._id, "admin"),
      });
    }

    
    if (role === "doctor") {
      const exists = await Doctor.findOne({ email });
      if (exists)
        return res.status(400).json({ message: "Doctor email already used" });

      const doctor = await Doctor.create({
        name,
        email,
        password,
        ...rest,
      });

      return res.status(201).json({
        user: doctor,
        token: signToken(doctor._id, "doctor"),
      });
    }

   
    if (role === "patient") {
      const exists = await Patient.findOne({ email });
      if (exists)
        return res.status(400).json({ message: "Patient email already used" });

      const patient = await Patient.create({
        name,
        email,
        password,
        ...rest,
      });

      return res.status(201).json({
        user: patient,
        token: signToken(patient._id, "patient"),
      });
    }

    return res.status(400).json({ message: "Invalid role" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role)
      return res.status(400).json({ message: "All fields required" });

    let user;

    if (role === "admin") user = await Admin.findOne({ email });
    if (role === "doctor") user = await Doctor.findOne({ email });
    if (role === "patient") user = await Patient.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const valid =
      user.matchPassword && (await user.matchPassword(password));

    if (!valid)
      return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      user,
      token: signToken(user._id, role),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
