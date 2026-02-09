import nodemailer from "nodemailer";
import Notification from "../models/Notification.js";

const getTransporter = () => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
};

export const sendEmail = async ({ to, subject, text }) => {
  const transporter = getTransporter();
  if (!transporter || !to) return false;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
  return true;
};

export const sendSms = async (_payload) => {
  // Placeholder: integrate SMS provider (Twilio, etc.)
  return false;
};

export const createInAppNotification = async ({
  title,
  body,
  user,
  role,
  meta,
}) => {
  const userModel =
    role === "admin" ? "Admin" : role === "doctor" ? "Doctor" : "Patient";
  return Notification.create({ title, body, user, userModel, role, meta });
};
