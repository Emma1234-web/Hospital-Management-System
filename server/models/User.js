import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      required: true,
    },

    // Only for doctors/patients
    phone: String,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    // Doctor-only fields
    specialization: String,
    experience: Number,

    // Patient-only fields
    age: Number,
    bloodGroup: String,
    address: String,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
