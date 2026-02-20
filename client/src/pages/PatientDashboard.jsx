import { useEffect, useState } from "react";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { ErrorBanner, EmptyState } from "../components/Feedback";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?._id) return;

    API.get("/appointments/mine")
      .then((res) => setAppointments(res.data.data || []))
      .catch((err) => {
        const message = err?.response?.data?.message || "Failed to load appointments";
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));

    API.get("/patients/dashboard-stats")
      .then((res) => setStats(res.data.data || null))
      .catch((err) => {
        const message = err?.response?.data?.message || "Failed to load dashboard stats";
        setError(message);
      });
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Patient Dashboard</h1>
        <p className="page-subtitle">Track your upcoming visits and status.</p>
      </div>

      <ErrorBanner message={error} />

      <section className="card-grid">
        <div className="stat-card">
          <div className="stat-label">Appointments</div>
          <div className="stat-value">{stats?.appointments ?? "--"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Upcoming</div>
          <div className="stat-value">{stats?.upcoming ?? "--"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unpaid Invoices</div>
          <div className="stat-value">{stats?.unpaidInvoices ?? "--"}</div>
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

      {loading && <p>Loading...</p>}

      {!loading && appointments.length === 0 && (
        <EmptyState title="No appointments" description="Book an appointment to get started." />
      )}

      <div className="grid gap-4">
        {appointments.map((a) => (
          <div key={a._id} className="surface p-4">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">
                  Doctor: {a.doctorId?.name || "Unassigned"}
                </div>
                <div className="text-sm text-gray-600">
                  {a.date} - {a.time}
                </div>
              </div>
              <span className="capitalize">{a.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
