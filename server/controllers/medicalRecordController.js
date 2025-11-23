import MedicalRecord from "../models/MedicalRecord.js";
import { paginate } from "../utils/paginate.js";

export const createRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.create(req.body);
    res.status(201).json({ success: true, record });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await paginate(MedicalRecord, {}, Number(page), Number(limit), "patient doctor");
    res.json(result);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
