import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white text-gray-800 px-8 py-4 flex justify-between items-center shadow-sm border-b border-gray-200">
      <h1 className="text-2xl font-bold">🏥 Hospital Management</h1>
      <div className="space-x-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <Link to="/patients" className="hover:text-blue-600">Patients</Link>
        <Link to="/appointments" className="hover:text-blue-600">Appointments</Link>
      </div>
    </nav>
  );
}

export default Navbar;
