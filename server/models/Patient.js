import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, default: 0 },
  gender: { type: String, enum: ["male","female"], required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  password: { type: String, required: true },
  medicalHistory: { type: String, default: "" },
}, { timestamps: true });

patientSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

patientSchema.methods.comparePassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model("Patient", patientSchema);
