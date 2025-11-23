import mongoose from "mongoose";

const MedicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  diagnosis: { type: String, required: true },
  treatment: { type: String, required: true },
  notes: { type: String },
  date: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("MedicalRecord", MedicalRecordSchema);
