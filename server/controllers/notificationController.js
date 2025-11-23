import { sendEmail } from "../utils/sendEmail.js";

export const sendAppointmentEmail = async (req, res) => {
  try {
    const { email, patientName, date, time, doctorName } = req.body;
    const html = `<h2>Appointment</h2><p>Hi ${patientName} — your appointment with Dr. ${doctorName} on ${date} at ${time} is confirmed.</p>`;
    await sendEmail(email, "Appointment Confirmation", html);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
