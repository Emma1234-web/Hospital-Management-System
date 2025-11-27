import { Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="px-6 md:px-10 py-4 shadow-sm bg-white">
      <div className="flex items-center justify-between">
        
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600">Hospital</div>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-8 text-gray-700">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/patients">Patients</Link></li>
          <li><Link to="/doctors">Doctors</Link></li>
          <li><Link to="/appointments">Appointments</Link></li>
          <li><Link to="/profile">Profile</Link></li>
        </ul>

        {/* Search + Login for Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <button className="text-lg">🔍</button>
          <Link
            to="/login"
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
          >
            Login
          </Link>
        </div>

        {/* Hamburger Menu Button (Mobile) */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✖️" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 text-gray-700">
          <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
          <Link to="/patients" onClick={() => setIsOpen(false)}>Patients</Link>
          <Link to="/doctors" onClick={() => setIsOpen(false)}>Doctors</Link>
          <Link to="/appointments" onClick={() => setIsOpen(false)}>Appointments</Link>
          <Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>

          {/* Search + Login for mobile */}
          <div className="flex items-center gap-3 mt-2">
            <button className="text-lg">🔍</button>
            <Link
              to="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
