import { useEffect, useState } from "react";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    API.get(`/appointments?patient=${user._id}`)
      .then(res => setAppointments(res.data.data || []))
      .catch(() => toast.error("Failed to load appointments"))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Patient Dashboard</h1>

      {loading && <p>Loading...</p>}

      {!loading && appointments.length === 0 && (
        <div className="bg-white p-4 rounded shadow">No appointments yet</div>
      )}

      <div className="grid gap-4">
        {appointments.map(a => (
          <div key={a._id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">
                  Doctor: {a.doctor?.name}
                </div>
                <div className="text-sm text-gray-600">
                  {a.date} • {a.time}
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
