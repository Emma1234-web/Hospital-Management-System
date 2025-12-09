// client/src/pages/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Hospital Management System</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow text-center">
          <div className="text-4xl mb-3">👥</div>
          <h3 className="font-semibold">Patients</h3>
          <p className="text-sm text-gray-600">Manage patient records and appointments.</p>
          <Link to="/patients" className="text-blue-600 mt-3 inline-block">Open</Link>
        </div>

        <div className="bg-white p-6 rounded shadow text-center">
          <div className="text-4xl mb-3">🩺</div>
          <h3 className="font-semibold">Doctors</h3>
          <p className="text-sm text-gray-600">Manage doctors and schedules.</p>
          <Link to="/doctors" className="text-blue-600 mt-3 inline-block">Open</Link>
        </div>

        <div className="bg-white p-6 rounded shadow text-center">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="font-semibold">Appointments</h3>
          <p className="text-sm text-gray-600">View and create appointments.</p>
          <Link to="/appointments" className="text-blue-600 mt-3 inline-block">Open</Link>
        </div>
      </div>
    </div>
  );
}
