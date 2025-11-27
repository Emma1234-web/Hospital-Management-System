import { useEffect, useState } from "react";
import api from "../api/api";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api
      .get("/doctors")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Doctors</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {doctors.map((d) => (
          <div key={d._id} className="bg-white shadow-md rounded-xl p-6 text-center">
            <div className="text-6xl mb-3">👨‍⚕️</div>
            <h2 className="text-xl font-semibold">{d.name}</h2>
            <p className="text-gray-500">{d.specialization}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
