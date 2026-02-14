import { useEffect, useState } from "react";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { ErrorBanner, EmptyState } from "../components/Feedback";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
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
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Patient Dashboard</h1>
        <p className="page-subtitle">Track your upcoming visits and status.</p>
      </div>

      <ErrorBanner message={error} />

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
