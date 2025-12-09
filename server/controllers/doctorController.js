import Doctor from "../models/Doctor.js";

export const createDoctor = async (req, res) => {
  const doc = await Doctor.create(req.body);
  res.status(201).json(doc);
};

export const getDoctors = async (req, res) => {
  const docs = await Doctor.find();
  res.json(docs);
};

export const getDoctor = async (req, res) => {
  const doc = await Doctor.findById(req.params.id);
  res.json(doc);
};

export const updateDoctor = async (req, res) => {
  const doc = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(doc);
};

export const deleteDoctor = async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
