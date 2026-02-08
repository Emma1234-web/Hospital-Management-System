import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  message: String,
  read: { type: Boolean, default: false }
},{timestamps:true});

export default mongoose.model("Notification", notificationSchema);
