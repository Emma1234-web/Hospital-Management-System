import { sendEmail } from "../utils/sendEmail.js";

// Send appointment email
export const sendAppointmentEmail = async (req, res) => {
  try {
    const { email, patientName, date, time, doctorName } = req.body;

    const message = `
      <h2>Appointment Confirmation</h2>
      <p>Dear <strong>${patientName}</strong>,</p>
      <p>Your appointment has been scheduled.</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
      <br />
      <p>Thank you for choosing Hospital Management System</p>
    `;

    await sendEmail(email, "Appointment Confirmation", message);

    res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// General email sender
export const sendCustomEmail = async (req, res) => {
  try {
    const { email, subject, html } = req.body;

    await sendEmail(email, subject, html);

    res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
