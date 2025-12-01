import { useState, useEffect } from "react";
import axios from "axios";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Patients</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p>Loading patients...</p>
      ) : patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <ul className="space-y-2">
          {patients.map((p) => (
            <li key={p._id} className="border p-3 rounded">
              <p><strong>Name:</strong> {p.name}</p>
              <p><strong>Email:</strong> {p.email}</p>
              <p><strong>Age:</strong> {p.age || "N/A"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
