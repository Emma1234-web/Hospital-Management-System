import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  specialization: { type: String, required: true },
  phone: { type: String, required: true },
  experience: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Doctor", doctorSchema);
