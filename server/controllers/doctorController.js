import Doctor from "../models/Doctor.js";

export const getDoctorById = async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id).select("-password");
    if (!doc) return res.status(404).json({ message: "Doctor not found" });
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateDoctor = async (req, res) => {
  try {
    const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
