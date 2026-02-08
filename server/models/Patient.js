import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: Number,
    gender: String,
    phone: String,
    address: String,
    medicalHistory: { type: String, default: "" },
    allergies: { type: String, default: "" },
    role: { type: String, default: "patient", immutable: true }
  },
  { timestamps: true }
);

patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

patientSchema.methods.matchPassword = function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

export default mongoose.model("Patient", patientSchema);
