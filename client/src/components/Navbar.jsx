// client/src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600">Hospital</Link>

        <nav className="hidden md:flex gap-6 items-center">
          <Link to="/" className="text-gray-700">Home</Link>
          <Link to="/appointments" className="text-gray-700">Appointments</Link>
          {!user ? (
            <>
              <button onClick={() => navigate("/login")} className="px-4 py-1 bg-blue-600 text-white rounded">Login</button>
              <button onClick={() => navigate("/register")} className="px-4 py-1 border border-blue-600 text-blue-600 rounded">Register</button>
            </>
          ) : (
            <>
              {user.role === "admin" && <Link to="/admin-dashboard" className="text-gray-700">Admin</Link>}
              {user.role === "doctor" && <Link to="/doctor-dashboard" className="text-gray-700">Doctor</Link>}
              {user.role === "patient" && <Link to="/patient-dashboard" className="text-gray-700">Patient</Link>}
              <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
            </>
          )}
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? "✖" : "☰"}</button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white px-4 py-3">
          <Link to="/" onClick={() => setOpen(false)} className="block py-1">Home</Link>
          <Link to="/appointments" onClick={() => setOpen(false)} className="block py-1">Appointments</Link>
          {!user ? (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block py-1">Login</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="block py-1">Register</Link>
            </>
          ) : (
            <>
              {user.role === "admin" && <Link to="/admin-dashboard" onClick={() => setOpen(false)} className="block py-1">Admin</Link>}
              {user.role === "doctor" && <Link to="/doctor-dashboard" onClick={() => setOpen(false)} className="block py-1">Doctor</Link>}
              {user.role === "patient" && <Link to="/patient-dashboard" onClick={() => setOpen(false)} className="block py-1">Patient</Link>}
              <button onClick={() => { logout(); setOpen(false); }} className="block w-full text-left py-1 text-red-600">Logout</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
