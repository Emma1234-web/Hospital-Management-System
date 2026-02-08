import { useEffect, useState } from "react";
import API from "../api/axios";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);

  const loadAppointments = async () => {
    const res = await API.get("/appointments/doctor");
    setAppointments(res.data);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    await API.patch(`/appointments/${id}/${status}`);
    loadAppointments();
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">My Appointments</h1>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Patient</th>
            <th className="p-2 border">Reason</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((a) => (
            <tr key={a._id}>
              <td className="p-2 border">{a.patientId.name}</td>
              <td className="p-2 border">{a.reason}</td>
              <td className="p-2 border">{a.status}</td>
              <td className="p-2 border flex gap-2">
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
  );
}
