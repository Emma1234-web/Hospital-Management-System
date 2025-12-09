import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },

    diagnosis: { type: String, required: true },
    treatment: { type: String, required: true },
    medication: { type: String, required: true },

    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("MedicalRecord", medicalRecordSchema);
