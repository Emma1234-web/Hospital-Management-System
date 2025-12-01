import { useState, useEffect } from "react";
import axios from "axios";

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchRecords = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/medical-records", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching medical records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  if (loading) return <p className="text-center mt-6">Loading medical records...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Medical Records</h2>
      {records.length === 0 ? (
        <p>No medical records found</p>
      ) : (
        <table className="w-full table-auto border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Patient</th>
              <th className="border px-4 py-2">Doctor</th>
              <th className="border px-4 py-2">Diagnosis</th>
              <th className="border px-4 py-2">Treatment</th>
              <th className="border px-4 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td className="border px-4 py-2">{r.patient.name}</td>
                <td className="border px-4 py-2">{r.doctor.name}</td>
                <td className="border px-4 py-2">{r.diagnosis}</td>
                <td className="border px-4 py-2">{r.treatment}</td>
                <td className="border px-4 py-2">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
