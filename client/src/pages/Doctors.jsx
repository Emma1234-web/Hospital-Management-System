/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import API from "../api/axios";
import Modal from "../components/Modal";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    specialization: "",
    phone: "",
  });

  const [selectedId, setSelectedId] = useState(null);

  const loadDoctors = async () => {
    try {
      const res = await API.get("/doctors");
      setDoctors(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const openAdd = () => {
    setEditMode(false);
    setForm({ name: "", email: "", specialization: "", phone: "" });
    setOpen(true);
  };

  const openEdit = (d) => {
    setEditMode(true);
    setSelectedId(d._id);
    setForm({
      name: d.name,
      email: d.email,
      specialization: d.specialization,
      phone: d.phone,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await API.put(`/doctors/${selectedId}`, form);
      } else {
        await API.post("/doctors", form);
      }
      setOpen(false);
      loadDoctors();
    } catch (err) {
      console.log(err);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete doctor?")) return;

    try {
      await API.delete(`/doctors/${id}`);
      loadDoctors();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-5">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          + Add Doctor
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Specialization</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {doctors.map((d) => (
              <tr key={d._id}>
                <td className="p-2 border">{d.name}</td>
                <td className="p-2 border">{d.email}</td>
                <td className="p-2 border">{d.specialization}</td>
                <td className="p-2 border">{d.phone}</td>
                <td className="p-2 border flex gap-2">
                  <button onClick={() => openEdit(d)} className="bg-green-700 text-white px-3 py-1 rounded">
                    Edit
                  </button>
                  <button onClick={() => remove(d._id)} className="bg-red-600 text-white px-3 py-1 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editMode ? "Edit Doctor" : "Add Doctor"} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-3">
          <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

          <button onClick={handleSubmit} className="bg-blue-600 text-white py-2 rounded">
            {editMode ? "Save Changes" : "Add Doctor"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
