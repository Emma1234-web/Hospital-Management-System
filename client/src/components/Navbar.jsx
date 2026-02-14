// client/src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Hospital
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          <Link to="/" className="nav-link">
            Home
          </Link>
          {user && (
            <Link to="/appointments" className="nav-link">
              Appointments
            </Link>
          )}
          {user && user.role === "patient" && (
            <Link to="/book-appointment" className="nav-link">
              Book
            </Link>
          )}

          {!user ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-1 bg-blue-600 text-white rounded"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-1 border border-blue-600 text-blue-600 rounded"
              >
                Register
              </button>
            </>
          ) : (
            <>
              {user.role === "admin" && (
                <Link to="/admin-dashboard" className="nav-link">
                  Admin
                </Link>
              )}
              {user.role === "doctor" && (
                <Link to="/doctor-dashboard" className="nav-link">
                  Doctor
                </Link>
              )}
              {user.role === "patient" && (
                <Link to="/patient-dashboard" className="nav-link">
                  Patient
                </Link>
              )}

              <div
                className="relative"
                onMouseEnter={() => {
                  if (dropdownTimeoutRef.current) {
                    clearTimeout(dropdownTimeoutRef.current);
                  }
                  setDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  dropdownTimeoutRef.current = setTimeout(() => {
                    setDropdownOpen(false);
                  }, 200);
                }}
              >
                <button className="nav-pill flex items-center gap-1">
                  More
                  <span
                    className={`text-xs transition-transform ${
                      dropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    v
                  </span>
                </button>
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fadeIn"
                    onMouseEnter={() => {
                      if (dropdownTimeoutRef.current) {
                        clearTimeout(dropdownTimeoutRef.current);
                      }
                      setDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      dropdownTimeoutRef.current = setTimeout(() => {
                        setDropdownOpen(false);
                      }, 200);
                    }}
                  >
                    {(user.role === "admin" || user.role === "patient") && (
                      <Link
                        to="/billing"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Billing
                      </Link>
                    )}
                    <Link
                      to="/prescriptions"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Prescriptions
                    </Link>
                    <Link
                      to="/lab-results"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Lab Results
                    </Link>
                    <Link
                      to="/notifications"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Notifications
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        to="/audit-logs"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Audit Logs
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={logout}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Logout
              </button>
            </>
          )}
        </nav>

        <button
          className="md:hidden"
          onClick={() => {
            setOpen(!open);
            setDropdownOpen(false);
          }}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white px-4 py-3">
          <Link to="/" onClick={() => setOpen(false)} className="block py-1">
            Home
          </Link>
          {user && (
            <Link
              to="/appointments"
              onClick={() => setOpen(false)}
              className="block py-1"
            >
              Appointments
            </Link>
          )}
          {user && user.role === "patient" && (
            <Link
              to="/book-appointment"
              onClick={() => setOpen(false)}
              className="block py-1"
            >
              Book Appointment
            </Link>
          )}
          {user && (user.role === "admin" || user.role === "patient") && (
            <Link
              to="/billing"
              onClick={() => setOpen(false)}
              className="block py-1"
            >
              Billing
            </Link>
          )}
          {user && (
            <Link
              to="/prescriptions"
              onClick={() => setOpen(false)}
              className="block py-1"
            >
              Prescriptions
            </Link>
          )}
          {user && (
            <Link
              to="/lab-results"
              onClick={() => setOpen(false)}
              className="block py-1"
            >
              Lab Results
            </Link>
          )}
          {user && (
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block py-1"
            >
              Notifications
            </Link>
          )}
          {user && user.role === "admin" && (
            <Link
              to="/audit-logs"
              onClick={() => setOpen(false)}
              className="block py-1"
            >
              Audit Logs
            </Link>
          )}
          {!user ? (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block py-1">
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="block py-1"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {user.role === "admin" && (
                <Link
                  to="/admin-dashboard"
                  onClick={() => setOpen(false)}
                  className="block py-1"
                >
                  Admin
                </Link>
              )}
              {user.role === "doctor" && (
                <Link
                  to="/doctor-dashboard"
                  onClick={() => setOpen(false)}
                  className="block py-1"
                >
                  Doctor
                </Link>
              )}
              {user.role === "patient" && (
                <Link
                  to="/patient-dashboard"
                  onClick={() => setOpen(false)}
                  className="block py-1"
                >
                  Patient
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="block w-full text-left py-1 text-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
