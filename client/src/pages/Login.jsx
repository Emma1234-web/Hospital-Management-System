// client/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", role: "patient" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      login(res.data.token, res.data.user);
      toast.success("Logged in");
      if (res.data.user.role === "admin") navigate("/admin-dashboard");
      else if (res.data.user.role === "doctor") navigate("/doctor-dashboard");
      else navigate("/patient-dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        <form onSubmit={submit} className="space-y-3">
          <select className="w-full p-2 border rounded" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>

          <input className="w-full p-2 border rounded" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input className="w-full p-2 border rounded" type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <button disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded">{loading ? "Signing in..." : "Login"}</button>
        </form>

        <p className="text-center text-gray-600 mt-3">
          Don't have an account? <span onClick={()=>navigate("/register")} className="text-blue-600 cursor-pointer">Register</span>
        </p>
      </div>
    </div>
  );
}
