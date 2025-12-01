import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

export const createDoctor = async (req, res) => {
  try {
    const { name, email, specialization, phone, experience, password } = req.body;
    const exists = await Doctor.findOne({ email });
    if (exists) return res.status(400).json({ message: "Doctor email exists" });
    const doctor = await Doctor.create({ name, email, specialization, phone, experience, password });
    res.status(201).json({ success: true, doctor });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const createPatient = async (req, res) => {
  try {
    const { name, email, age, gender, phone, address, password } = req.body;
    const exists = await Patient.findOne({ email });
    if (exists) return res.status(400).json({ message: "Patient email exists" });
    const patient = await Patient.create({ name, email, age, gender, phone, address, password });
    res.status(201).json({ success: true, patient });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getAllDoctors = async (req, res) => {
  try {
    const docs = await Doctor.find().select("-password");
    res.json(docs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().select("-password");
    res.json(patients);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteDoctor = async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deletePatient = async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
