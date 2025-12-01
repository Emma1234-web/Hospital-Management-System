/* eslint-disable react-hooks/set-state-in-effect */
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="font-bold text-xl">
        Jabaka Hospital
      </Link>

      <div className="space-x-4">
        {user ? (
          <>
            {user.role === "admin" && (
              <Link to="/admin-dashboard" className="hover:underline">
                Dashboard
              </Link>
            )}
            {user.role === "doctor" && (
              <Link to="/doctor-dashboard" className="hover:underline">
                Dashboard
              </Link>
            )}
            {user.role === "patient" && (
              <Link to="/patient-dashboard" className="hover:underline">
                Dashboard
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
