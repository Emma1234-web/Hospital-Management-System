import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // Save login session
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (user.role === "doctor") {
        navigate("/doctor-dashboard");
      } else if (user.role === "patient") {
        navigate("/patient-dashboard");
      } else {
        navigate("/dashboard"); // default
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Hospital Login
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md text-center mb-4">
            <p>{error}</p>

            {/* If user does not exist → show register button */}
            {error.toLowerCase().includes("not found") && (
              <button
                onClick={() => navigate("/register")}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create an Account
              </button>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* Register Redirect */}
        <p className="text-center text-gray-600 mt-4">
          Don’t have an account?
          <span
            className="text-blue-600 ml-1 cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>

      </div>
    </div>
  );
}
