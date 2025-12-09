import MedicalRecord from "../models/MedicalRecord.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

export const createMedicalRecord = async (req, res) => {
  try {
    const { patient, doctor, diagnosis, treatment, notes, prescription } = req.body;
    if (!patient || !doctor || !diagnosis || !treatment) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const p = await Patient.findById(patient);
    const d = await Doctor.findById(doctor);
    if (!p || !d) return res.status(400).json({ message: "Invalid patient/doctor" });

    const rec = await MedicalRecord.create({ patient, doctor, diagnosis, treatment, notes, prescription });
    res.status(201).json({ success: true, data: rec });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getMedicalRecords = async (req, res) => {
  try {
    const filter = {};
    if (req.query.patient) filter.patient = req.query.patient;
    if (req.query.doctor) filter.doctor = req.query.doctor;

    // restrict: patient sees only theirs
    if (req.user.role === "patient") filter.patient = req.user.id;
    if (req.user.role === "doctor") filter.doctor = req.user.id;

    const list = await MedicalRecord.find(filter)
      .populate("patient", "name email")
      .populate("doctor", "name specialization")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: list });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getMedicalRecord = async (req, res) => {
  try {
    const r = await MedicalRecord.findById(req.params.id)
      .populate("patient", "name email")
      .populate("doctor", "name specialization");
    if (!r) return res.status(404).json({ success: false, message: "Not found" });

    if (req.user.role === "patient" && r.patient._id.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Access denied" });

    res.json({ success: true, data: r });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const updateMedicalRecord = async (req, res) => {
  try {
    const r = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!r) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: r });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const deleteMedicalRecord = async (req, res) => {
  try {
    const r = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
