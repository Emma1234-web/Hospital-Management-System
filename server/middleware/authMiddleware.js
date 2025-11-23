import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🔹 Protect any authenticated user
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (without password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

// 🔹 Role-based access (general)
export const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });

  if (req.user.role !== role) {
    return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
  }

  next();
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};
