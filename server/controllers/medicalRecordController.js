import MedicalRecord from "../models/MedicalRecord.js";

export const createRecord = async (req, res) => {
  try {
    const rec = await MedicalRecord.create(req.body);
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getRecordsForPatient = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.patientId }).populate("doctor", "name");
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
