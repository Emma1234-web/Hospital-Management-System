import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, patRes, appRes] = await Promise.all([
        axios.get("http://localhost:5000/api/doctors", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/patients", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/appointments", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setDoctors(docRes.data);
      setPatients(patRes.data);
      setAppointments(appRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p className="p-6">Loading dashboard...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>

      <section>
        <h3 className="text-xl font-semibold mb-2">Doctors</h3>
        {doctors.length === 0 ? <p>No doctors found</p> : (
          <ul className="space-y-2">
            {doctors.map(d => (
              <li key={d._id} className="border p-2 rounded">
                {d.name} ({d.email})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-2">Patients</h3>
        {patients.length === 0 ? <p>No patients found</p> : (
          <ul className="space-y-2">
            {patients.map(p => (
              <li key={p._id} className="border p-2 rounded">
                {p.name} ({p.email})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-2">Appointments</h3>
        {appointments.length === 0 ? <p>No appointments found</p> : (
          <ul className="space-y-2">
            {appointments.map(a => (
              <li key={a._id} className="border p-2 rounded">
                {a.patient.name} with {a.doctor.name} on {new Date(a.date).toLocaleDateString()} at {a.time}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
