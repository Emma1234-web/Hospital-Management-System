import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  reason: { type: String },
  status: { type: String, enum: ["pending","approved","completed","cancelled"], default: "pending" },
}, { timestamps: true });

export default mongoose.model("Appointment", AppointmentSchema);
