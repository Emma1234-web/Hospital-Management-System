import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";
import { ErrorBanner } from "../components/Feedback";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/admin/stats")
      .then((res) => setStats(res.data.data || null))
      .catch((err) =>
        setError(err?.response?.data?.message || "Failed to load dashboard stats")
      );
  }, []);

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name}</p>
      </div>

      <ErrorBanner message={error} />

      <section className="card-grid">
        <div className="stat-card">
          <div className="stat-label">Patients</div>
          <div className="stat-value">{stats?.patients ?? "--"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Doctors</div>
          <div className="stat-value">{stats?.doctors ?? "--"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Appointments</div>
          <div className="stat-value">{stats?.appointments ?? "--"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Appointments</div>
          <div className="stat-value">{stats?.pendingAppointments ?? "--"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unpaid Invoices</div>
          <div className="stat-value">{stats?.unpaidInvoices ?? "--"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unread Notifications</div>
          <div className="stat-value">{stats?.unreadNotifications ?? "--"}</div>
        </div>
      </section>

      <section className="card-grid">
        <div className="stat-card">
          <div className="stat-label">Operations</div>
          <div className="stat-value">Patients</div>
          <p className="text-sm text-gray-600">Manage patient records and profiles.</p>
          <Link to="/patients" className="btn-secondary w-fit mt-3">Open</Link>
        </div>
        <div className="stat-card">
          <div className="stat-label">Staff</div>
          <div className="stat-value">Doctors</div>
          <p className="text-sm text-gray-600">Availability, roles, and schedules.</p>
          <Link to="/doctors" className="btn-secondary w-fit mt-3">Open</Link>
        </div>
        <div className="stat-card">
          <div className="stat-label">Scheduling</div>
          <div className="stat-value">Appointments</div>
          <p className="text-sm text-gray-600">Track approvals and assignments.</p>
          <Link to="/appointments" className="btn-secondary w-fit mt-3">Open</Link>
        </div>
        <div className="stat-card">
          <div className="stat-label">Finance</div>
          <div className="stat-value">Billing</div>
          <p className="text-sm text-gray-600">Invoices, payments, and reports.</p>
          <Link to="/billing" className="btn-secondary w-fit mt-3">Open</Link>
        </div>
        <div className="stat-card">
          <div className="stat-label">Clinical</div>
          <div className="stat-value">Prescriptions</div>
          <p className="text-sm text-gray-600">Medication history and refills.</p>
          <Link to="/prescriptions" className="btn-secondary w-fit mt-3">Open</Link>
        </div>
        <div className="stat-card">
          <div className="stat-label">Compliance</div>
          <div className="stat-value">Audit Logs</div>
          <p className="text-sm text-gray-600">Trace changes and activity.</p>
          <Link to="/audit-logs" className="btn-secondary w-fit mt-3">Open</Link>
        </div>
      </section>
    </div>
  );
}
