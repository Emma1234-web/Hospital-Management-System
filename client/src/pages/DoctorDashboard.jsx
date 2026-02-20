import { useEffect, useState } from "react";
import API from "../api/axios";
import { ErrorBanner, EmptyState } from "../components/Feedback";
import toast from "react-hot-toast";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
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
    API.get("/doctors/dashboard-stats")
      .then((res) => setStats(res.data.data || null))
      .catch((err) =>
        setError(err?.response?.data?.message || "Failed to load dashboard stats")
      );
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/appointments/${id}/${status}`);
      toast.success(`Appointment ${status}d`);
      loadAppointments();
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${status} appointment`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Doctor Dashboard</h1>
        <p className="page-subtitle">Review and respond to upcoming appointments.</p>
      </div>

      <ErrorBanner message={error} />

      <section className="card-grid">
        <div className="stat-card">
          <div className="stat-label">Appointments</div>
          <div className="stat-value">{stats?.appointments ?? "--"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending/Assigned</div>
          <div className="stat-value">{stats?.pendingOrAssigned ?? "--"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Approved</div>
          <div className="stat-value">{stats?.approved ?? "--"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Prescriptions</div>
          <div className="stat-value">{stats?.prescriptions ?? "--"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Lab Results</div>
          <div className="stat-value">{stats?.labResults ?? "--"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unread Notifications</div>
          <div className="stat-value">{stats?.unreadNotifications ?? "--"}</div>
        </div>
      </section>

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
                {(a.status === "assigned" || a.status === "pending") && (
                  <>
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
                  </>
                )}
                {a.status === "approved" && (
                  <span className="px-3 py-1 rounded bg-green-100 text-green-700 text-xs">
                    Already approved
                  </span>
                )}
                {a.status === "rejected" && (
                  <span className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs">
                    Already rejected
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
