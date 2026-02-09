import mongoose from "mongoose";

const labResultSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    testName: { type: String, required: true },
    resultText: { type: String, default: "" },
    resultFileName: { type: String, default: "" },
    resultFileType: { type: String, default: "" },
    resultFileData: { type: String, default: "" }, // base64 data URL
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
    },
  },
  { timestamps: true }
);

export default mongoose.model("LabResult", labResultSchema);
