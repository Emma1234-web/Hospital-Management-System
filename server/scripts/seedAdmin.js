import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

dotenv.config();
await connectDB();

const main = async () => {
  const exists = await Admin.findOne({ email: process.env.SEED_ADMIN_EMAIL });
  if (exists) { console.log("Admin already exists"); process.exit(0); }
  const admin = await Admin.create({
    name: process.env.SEED_ADMIN_NAME || "Super Admin",
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASS,
  });
  console.log("Created admin:", admin.email);
  process.exit(0);
};

main().catch((err) => { console.error(err); process.exit(1); });
