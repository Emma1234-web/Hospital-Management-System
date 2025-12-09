/* eslint-disable react-hooks/set-state-in-effect */
// client/src/pages/Appointments.jsx
import { useEffect, useState } from "react";
import API from "../api/axios";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const fetchAll = async () => {
    try {
      const [aRes, dRes, pRes] = await Promise.all([
        API.get("/appointments"),
        API.get("/doctors"),
        API.get("/patients"),
      ]);
      setAppointments(aRes.data.data || aRes.data);
      setDoctors(dRes.data.data || dRes.data);
      setPatients(pRes.data.data || pRes.data);
    } catch {
      toast.error("Failed to load");
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
      if (current) {
        await API.put(`/appointments/${current._id}`, data);
        toast.success("Updated");
      } else {
        await API.post("/appointments", data);
        toast.success("Created");
      }
      setModalOpen(false); fetchAll();
    } catch {
      toast.error("Failed");
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/appointments/${current._id}`);
      toast.success("Deleted");
      setConfirmOpen(false);
      fetchAll();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Appointments</h1>
        <button onClick={() => { setCurrent(null); setModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">New Appointment</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Patient</th>
              <th className="p-2 border">Doctor</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Time</th>
              <th className="p-2 border">Reason</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a._id} className="border-b">
                <td className="p-2">{a.patient?.name}</td>
                <td className="p-2">{a.doctor?.name}</td>
                <td className="p-2">{a.date}</td>
                <td className="p-2">{a.time}</td>
                <td className="p-2">{a.reason}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => { setCurrent(a); setModalOpen(true); }} className="text-blue-600">Edit</button>
                  <button onClick={() => { setCurrent(a); setConfirmOpen(true); }} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={current ? "Edit Appointment" : "New Appointment"}>
        <form onSubmit={submit} className="space-y-3">
          <select name="patient" defaultValue={current?.patient?._id || ""} required className="w-full p-2 border rounded">
            <option value="">Select patient</option>
            {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>

          <select name="doctor" defaultValue={current?.doctor?._id || ""} required className="w-full p-2 border rounded">
            <option value="">Select doctor</option>
            {doctors.map(d => <option key={d._1} value={d._id}>{d.name}</option>)}
          </select>

          <input name="date" defaultValue={current?.date || ""} type="date" required className="w-full p-2 border rounded" />
          <input name="time" defaultValue={current?.time || ""} type="time" required className="w-full p-2 border rounded" />
          <textarea name="reason" defaultValue={current?.reason || ""} className="w-full p-2 border rounded" placeholder="Reason" />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1 border rounded">Cancel</button>
            <button className="px-4 py-1 bg-green-600 text-white rounded">{current ? "Update" : "Create"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} />
    </div>
  );
}
