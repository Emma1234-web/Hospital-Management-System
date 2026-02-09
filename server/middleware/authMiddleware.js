import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let model = null;
    if (decoded.role === "admin") model = Admin;
    if (decoded.role === "doctor") model = Doctor;
    if (decoded.role === "patient") model = Patient;

    if (!model) {
      return res.status(401).json({ message: "Token invalid" });
    }

    req.user = await model.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
