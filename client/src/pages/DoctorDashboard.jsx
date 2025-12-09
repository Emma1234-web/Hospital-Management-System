
import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/appointments?doctor=${user?.id}`);
        setAppointments(res.data.data || res.data);
      } catch {
        toast.error("Failed to load");
      }
    };
    if (user) load();
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Doctor Dashboard</h1>
      <div className="grid gap-4">
        {appointments.map(a => (
          <div key={a._id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{a.patient?.name}</div>
                <div className="text-sm text-gray-600">{a.date} {a.time}</div>
              </div>
              <div className="text-sm">{a.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
