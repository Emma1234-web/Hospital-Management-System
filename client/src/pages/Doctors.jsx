/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import API from "../api/axios";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const fetchDoctors = async () => {
    try {
      const res = await API.get("/doctors");
      setDoctors(res.data.data || res.data);
    } catch {
      toast.error("Failed to fetch doctors");
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
      if (current) {
        await API.put(`/doctors/${current._id}`, data);
        toast.success("Doctor updated");
      } else {
        await API.post("/doctors", data);
        toast.success("Doctor created");
      }
      setModalOpen(false); fetchDoctors();
    } catch {
      toast.error("Action failed");
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/doctors/${current._id}`);
      toast.success("Deleted");
      setConfirmOpen(false);
      fetchDoctors();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Doctors</h1>
        <button onClick={() => { setCurrent(null); setModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">Add Doctor</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map(d => (
          <div key={d._id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{d.name}</div>
                <div className="text-sm text-gray-600">{d.specialization}</div>
                <div className="text-sm text-gray-500">{d.email}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => { setCurrent(d); setModalOpen(true); }} className="text-xs px-2 py-1 border rounded">Edit</button>
                <button onClick={() => { setCurrent(d); setConfirmOpen(true); }} className="text-xs px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={current ? "Edit Doctor": "Add Doctor"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="name" defaultValue={current?.name} className="w-full p-2 border rounded" placeholder="Name" required />
          <input name="email" defaultValue={current?.email} className="w-full p-2 border rounded" placeholder="Email" required />
          <input name="specialization" defaultValue={current?.specialization} className="w-full p-2 border rounded" placeholder="Specialization" />
          <input name="phone" defaultValue={current?.phone} className="w-full p-2 border rounded" placeholder="Phone" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1 border rounded">Cancel</button>
            <button className="px-4 py-1 bg-green-600 text-white rounded">Save</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} />
    </div>
  );
}
