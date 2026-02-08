import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctor: "",
    date: "",
    time: ""
  });

  useEffect(() => {
    API.get("/doctors").then(res => setDoctors(res.data));
  }, []);

  const submit = async () => {
    try {
      await API.post("/appointments", form);
      toast.success("Appointment booked");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="max-w-md bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-3">Book Appointment</h2>

      <select onChange={e=>setForm({...form,doctor:e.target.value})} className="border p-2 w-full mb-2">
        <option value="">Select Doctor</option>
        {doctors.map(d=>(
          <option key={d._id} value={d._id}>{d.name}</option>
        ))}
      </select>

      <input type="date" className="border p-2 w-full mb-2" onChange={e=>setForm({...form,date:e.target.value})} />
      <input type="time" className="border p-2 w-full mb-2" onChange={e=>setForm({...form,time:e.target.value})} />

      <button onClick={submit} className="bg-blue-600 text-white w-full py-2 rounded">
        Book
      </button>
    </div>
  );
}
