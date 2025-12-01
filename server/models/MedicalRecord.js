import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  notes: { type: String, default: "" },
  prescriptions: { type: String, default: "" },
  attachments: [{ type: String }],
}, { timestamps: true });

export default mongoose.model("MedicalRecord", medicalRecordSchema);
