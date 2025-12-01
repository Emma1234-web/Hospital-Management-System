import Patient from "../models/Patient.js";

export const getPatientById = async (req, res) => {
  try {
    const p = await Patient.findById(req.params.id).select("-password");
    if (!p) return res.status(404).json({ message: "Patient not found" });
    res.json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updatePatient = async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
