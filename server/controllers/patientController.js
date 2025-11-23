import Patient from "../models/Patient.js";
import { paginate } from "../utils/paginate.js";

export const createPatient = async (req, res) => {
  try {
    const p = await Patient.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, patient: p });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await paginate(Patient, {}, Number(page), Number(limit));
    res.json(result);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getSinglePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Not found" });
    res.json({ success: true, patient });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updatePatient = async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, patient: updated });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const deletePatient = async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
