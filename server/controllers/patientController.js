import Patient from "../models/Patient.js";

// CREATE
export const createPatient = async (req, res) => {
  try {
    const pat = await Patient.create(req.body);
    res.status(201).json(pat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ALL
export const getPatients = async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
};

// READ ONE
export const getPatient = async (req, res) => {
  const pat = await Patient.findById(req.params.id);
  res.json(pat);
};

// UPDATE
export const updatePatient = async (req, res) => {
  const pat = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(pat);
};

// DELETE
export const deletePatient = async (req, res) => {
  await Patient.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
