import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const schema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "admin" }
});

schema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

schema.methods.matchPassword = function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

export default mongoose.model("Admin", schema);
