import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AddPatient() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    password: "patient123", // default password
  });

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", { ...form, role: "patient" });
      toast.success("Patient added successfully!");
      navigate("/patients");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add patient");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Add Patient</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <select
          name="gender"
          className="border p-2 w-full"
          onChange={handleChange}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
