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
  const { q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (q) {
    const regex = new RegExp(q, "i");
    filter.$or = [
      { name: regex },
      { email: regex },
      { specialization: regex },
    ];
  }

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [total, doctors] = await Promise.all([
    Doctor.countDocuments(filter),
    Doctor.find(filter).skip(skip).limit(limitNum),
  ]);

  res.status(200).json({
    success: true,
    count: doctors.length,
    total,
    page: pageNum,
    limit: limitNum,
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
