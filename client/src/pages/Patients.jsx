/* eslint-disable react-hooks/immutability */
// src/pages/Patients.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../components/Modal";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", age: "", gender: "" });
  const [selectedId, setSelectedId] = useState(null);

  const API = "http://localhost:5000/api/patients";

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    const res = await axios.get(API);
    setPatients(res.data.data || []);
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm({ name: "", email: "", age: "", gender: "" });
    setOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditMode(true);
    setSelectedId(p._id);
    setForm({
      name: p.name,
      email: p.email,
      age: p.age,
      gender: p.gender,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (editMode) {
      await axios.put(`${API}/${selectedId}`, form);
    } else {
      await axios.post(API, form);
    }
    setOpen(false);
    loadPatients();
  };

  const deletePatient = async (id) => {
    if (confirm("Delete patient?")) {
      await axios.delete(`${API}/${id}`);
      loadPatients();
    }
  };

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Patients</h1>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Patient
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Age</th>
              <th className="p-2 border">Gender</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((p) => (
              <tr key={p._id} className="border">
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border">{p.email}</td>
                <td className="p-2 border">{p.age}</td>
                <td className="p-2 border">{p.gender}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deletePatient(p._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal open={open} title={editMode ? "Edit Patient" : "Add Patient"} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Age"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Gender"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          />

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white py-2 rounded-lg mt-2"
          >
            {editMode ? "Save Changes" : "Add Patient"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
