import Patient from "../models/Patient.js";

// CREATE (ADMIN)
export const createPatient = async (req, res, next) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
};

// READ ALL (ADMIN / DOCTOR)
export const getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find();
    res.status(200).json({ success: true, data: patients });
  } catch (err) {
    next(err);
  }
};

// READ ONE
export const getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    res.json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
};

// UPDATE
export const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
};

// DELETE
export const deletePatient = async (req, res, next) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
