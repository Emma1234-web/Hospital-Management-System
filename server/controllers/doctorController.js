import Doctor from "../models/Doctor.js";
import asyncHandler from "../middleware/asyncHandler.js";

// CREATE
export const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.create(req.body);

  res.status(201).json({
    success: true,
    data: doctor,
  });
});

// READ ALL
export const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find();

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
});

// READ ONE
export const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    const error = new Error("Doctor not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: doctor,
  });
});

// UPDATE
export const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!doctor) {
    const error = new Error("Doctor not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: doctor,
  });
});

// DELETE
export const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);

  if (!doctor) {
    const error = new Error("Doctor not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Doctor deleted successfully",
  });
});
