import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    API.get("/appointments").then(res => {
      setAppointments(res.data.data || []);
    });
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">All Appointments</h1>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Patient</th>
            <th className="border p-2">Doctor</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Time</th>
            <th className="border p-2">Status</th>
          </tr>
                 </thead>
        <tbody>
          {appointments.map(a => (
            <tr key={a._id}>
              <td className="border p-2">{a.patient?.name}</td>
              <td className="border p-2">{a.doctor?.name}</td>
              <td className="border p-2">{a.date}</td>
              <td className="border p-2">{a.time}</td>
              <td className="border p-2 capitalize">{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
          
