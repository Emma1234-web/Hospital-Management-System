import MedicalRecord from "../models/MedicalRecord.js";

// CREATE (Doctor)
export const createRecord = async (req, res) => {
  const record = await MedicalRecord.create({
    ...req.body,
    doctor: req.user.id
  });
  res.status(201).json(record);
};

// READ (Doctor / Patient)
export const getRecords = async (req, res) => {
  const filter = {};
  if (req.query.patient) filter.patient = req.query.patient;

  const records = await MedicalRecord.find(filter)
    .populate("doctor", "name")
    .populate("patient", "name");

  res.json(records);
};
