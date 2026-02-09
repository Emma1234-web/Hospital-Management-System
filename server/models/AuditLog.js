import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "actorModel",
      default: null,
    },
    actorModel: {
      type: String,
      enum: ["Admin", "Doctor", "Patient"],
      default: null,
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    before: {
      type: Object,
      default: null,
    },
    after: {
      type: Object,
      default: null,
    },
    message: String,
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
