import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userModel",
      default: null,
    },
    userModel: {
      type: String,
      enum: ["Admin", "Doctor", "Patient"],
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      default: null,
    },
    meta: { type: Object, default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
