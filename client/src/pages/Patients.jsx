/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import API from "../api/axios";
import Modal from "../components/Modal";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
  });

  const [selectedId, setSelectedId] = useState(null);

  const loadPatients = async () => {
    try {
      const res = await API.get("/patients");
      setPatients(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const openAdd = () => {
    setEditMode(false);
    setForm({ name: "", email: "", age: "", gender: "" });
    setOpen(true);
  };

  const openEdit = (p) => {
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
    try {
      if (editMode) {
        await API.put(`/patients/${selectedId}`, form);
      } else {
        await API.post("/patients", form);
      }
      setOpen(false);
      loadPatients();
    } catch (err) {
      console.log(err);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete patient?")) return;

    try {
      await API.delete(`/patients/${id}`);
      loadPatients();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-5">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Patients</h1>
        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Patient
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100 text-gray-600">
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
              <tr key={p._id}>
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border">{p.email}</td>
                <td className="p-2 border">{p.age}</td>
                <td className="p-2 border">{p.gender}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="bg-green-700 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p._id)}
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

      <Modal open={open} onClose={() => setOpen(false)} title={editMode ? "Edit Patient" : "Add Patient"}>
        <div className="flex flex-col gap-3">
          <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />

          <button onClick={handleSubmit} className="bg-blue-600 text-white py-2 rounded">
            {editMode ? "Save Changes" : "Add Patient"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
