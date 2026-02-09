import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String, default: "" },
    frequency: { type: String, default: "" },
    duration: { type: String, default: "" },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    medications: {
      type: [medicationSchema],
      required: true,
    },
    notes: String,
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    refillsAllowed: {
      type: Number,
      default: 0,
      min: 0,
    },
    refillsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
