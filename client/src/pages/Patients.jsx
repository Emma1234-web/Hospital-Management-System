/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import API from "../api/axios";
import Modal from "../components/Modal";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
  });

  const loadPatients = async () => {
    try {
      const res = await API.get("/patients");
      setPatients(res.data.data);
    } catch (err) {
      console.error("Load patients error:", err.response?.data || err.message);
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
      if (!form.name || !form.email) {
        alert("Name and Email are required");
        return;
      }

      if (editMode) {
        await API.put(`/patients/${selectedId}`, form);
      } else {
        await API.post("/patients", form);
      }

      setOpen(false);
      loadPatients();
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const removePatient = async (id) => {
    if (!window.confirm("Delete patient?")) return;

    try {
      await API.delete(`/patients/${id}`);
      loadPatients();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
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

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Age</th>
            <th className="border p-2">Gender</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {patients.map((p) => (
            <tr key={p._id}>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.email}</td>
              <td className="border p-2">{p.age}</td>
              <td className="border p-2">{p.gender}</td>
              <td className="border p-2 flex gap-2">
                <button
                  onClick={() => openEdit(p)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => removePatient(p._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editMode ? "Edit Patient" : "Add Patient"}
      >
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
            type="number"
            className="border p-2 rounded"
            placeholder="Age"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />

          <select
            className="border p-2 rounded"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white py-2 rounded"
          >
            {editMode ? "Save Changes" : "Add Patient"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
