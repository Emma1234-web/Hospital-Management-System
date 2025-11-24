import Patient from "../models/Patient.js";

// Create new patient
export const createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get patients with pagination
export const getPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const patients = await Patient.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Patient.countDocuments();

    res.json({
      success: true,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      patients,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single patient
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete
export const deletePatient = async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Patient removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
