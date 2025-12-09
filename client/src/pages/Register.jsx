import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    role: "patient",
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "male",
    specialization: "",
    phone: "",
    secret: "" // for admin registration
  });

  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/auth/register", form);
      toast.success("Registered — please login");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center mb-4">Register</h2>

        <form onSubmit={submit} className="space-y-3">
          
          {/* ROLE SELECTOR */}
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>

          {/* COMMON FIELDS */}
          <input
            required
            className="w-full p-2 border rounded"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            required
            className="w-full p-2 border rounded"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            required
            className="w-full p-2 border rounded"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* PATIENT FIELDS */}
          {form.role === "patient" && (
            <>
              <input
                className="w-full p-2 border rounded"
                placeholder="Age"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />

              <select
                className="w-full p-2 border rounded"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </>
          )}

          {/* DOCTOR FIELDS */}
          {form.role === "doctor" && (
            <>
              <input
                className="w-full p-2 border rounded"
                placeholder="Specialization"
                value={form.specialization}
                onChange={(e) =>
                  setForm({ ...form, specialization: e.target.value })
                }
              />

              <input
                className="w-full p-2 border rounded"
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </>
          )}

          {/* ADMIN FIELDS (Protected with SECRET KEY) */}
          {form.role === "admin" && (
            <input
              required
              className="w-full p-2 border rounded"
              placeholder="Admin Secret Code"
              value={form.secret}
              onChange={(e) => setForm({ ...form, secret: e.target.value })}
            />
          )}

          <button
            disabled={loading}
            className="w-full bg-green-600 text-white p-2 rounded"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
