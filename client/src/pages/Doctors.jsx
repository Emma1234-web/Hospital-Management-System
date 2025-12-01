import { useState, useEffect } from "react";
import axios from "axios";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Doctors</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p>Loading doctors...</p>
      ) : doctors.length === 0 ? (
        <p>No doctors found.</p>
      ) : (
        <ul className="space-y-2">
          {doctors.map((doc) => (
            <li key={doc._id} className="border p-3 rounded">
              <p><strong>Name:</strong> {doc.name}</p>
              <p><strong>Email:</strong> {doc.email}</p>
              <p><strong>Specialization:</strong> {doc.specialization || "N/A"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
