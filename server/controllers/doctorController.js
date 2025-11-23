import Doctor from "../models/Doctor.js";
import { paginate } from "../utils/paginate.js";

export const createDoctor = async (req, res) => {
  try {
    const d = await Doctor.create(req.body);
    res.status(201).json({ success: true, doctor: d });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getDoctors = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await paginate(Doctor, {}, Number(page), Number(limit));
    res.json(result);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getSingleDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Not found" });
    res.json({ success: true, doctor });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateDoctor = async (req, res) => {
  try {
    const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, doctor: updated });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const deleteDoctor = async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
