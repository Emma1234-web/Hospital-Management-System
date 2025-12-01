import { useState, useEffect } from "react";
import axios from "axios";

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/appointments", { headers: { Authorization: `Bearer ${token}` } });
      setAppointments(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) return <p className="p-6">Loading appointments...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Patient Dashboard</h2>
      {appointments.length === 0 ? <p>You have no appointments</p> : (
        <ul className="space-y-2">
          {appointments.map(a => (
            <li key={a._id} className="border p-2 rounded">
              With Dr. {a.doctor.name} on {new Date(a.date).toLocaleDateString()} at {a.time} ({a.reason})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
