import { useEffect, useState } from "react";
import API from "../api/axios";
import { ErrorBanner, EmptyState } from "../components/Feedback";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  const loadAppointments = async () => {
    try {
      setError("");
      const res = await API.get("/appointments/doctor");
      setAppointments(res.data.data || res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load appointments");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    await API.patch(`/appointments/${id}/${status}`);
    loadAppointments();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Doctor Dashboard</h1>
        <p className="page-subtitle">Review and respond to upcoming appointments.</p>
      </div>

      <ErrorBanner message={error} />

      {appointments.length === 0 && !error && (
        <EmptyState title="No appointments" description="No appointments assigned yet." />
      )}

      <div className="table-shell overflow-x-auto">
      <table className="table-pro">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((a) => (
            <tr key={a._id}>
              <td>{a.patientId.name}</td>
              <td>{a.reason}</td>
              <td className="capitalize">{a.status}</td>
              <td className="flex gap-2">
                <button
                  onClick={() => updateStatus(a._id, "approve")}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(a._id, "reject")}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
