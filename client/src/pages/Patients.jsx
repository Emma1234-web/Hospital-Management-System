/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import API from "../api/axios";
import Modal from "../components/Modal";
import { ErrorBanner, EmptyState } from "../components/Feedback";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState({});
  const [inlineId, setInlineId] = useState(null);
  const [inlineForm, setInlineForm] = useState({ age: "", gender: "" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
  });

  const loadPatients = async () => {
    try {
      setError("");
      const res = await API.get("/patients", {
        params: { q: search || undefined, page },
      });
      setPatients(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Load patients error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load patients");
    }
  };

  useEffect(() => {
    loadPatients();
  }, [page, search]);

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

  const bulkDelete = async () => {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0) return;
    if (!window.confirm("Delete selected patients?")) return;
    await Promise.all(ids.map((id) => API.delete(`/patients/${id}`)));
    setSelected({});
    loadPatients();
  };

  const startInline = (p) => {
    setInlineId(p._id);
    setInlineForm({ age: p.age || "", gender: p.gender || "" });
  };

  const saveInline = async (id) => {
    try {
      await API.put(`/patients/${id}`, inlineForm);
      setInlineId(null);
      loadPatients();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
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

      <ErrorBanner message={error} />

      <div className="flex items-center justify-between mb-3">
        <input
          className="border p-2 w-72"
          placeholder="Search patients..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <button
          className="px-3 py-2 bg-gray-800 text-white rounded"
          onClick={bulkDelete}
        >
          Delete (Bulk)
        </button>
      </div>

      {patients.length === 0 && !error && (
        <EmptyState title="No patients" description="Patients will appear here." />
      )}

      {patients.length > 0 && (
      <div className="table-shell overflow-x-auto">
        <table className="table-pro">
        <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Email</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {patients.map((p) => (
            <tr key={p._id}>
              <td>
                <input
                  type="checkbox"
                  checked={!!selected[p._id]}
                  onChange={(e) =>
                    setSelected((prev) => ({ ...prev, [p._id]: e.target.checked }))
                  }
                />
              </td>
              <td>{p.name}</td>
              <td>{p.email}</td>
              <td>
                {inlineId === p._id ? (
                  <input
                    className="border p-1 w-20"
                    value={inlineForm.age}
                    onChange={(e) => setInlineForm({ ...inlineForm, age: e.target.value })}
                  />
                ) : (
                  p.age
                )}
              </td>
              <td>
                {inlineId === p._id ? (
                  <select
                    className="border p-1"
                    value={inlineForm.gender}
                    onChange={(e) => setInlineForm({ ...inlineForm, gender: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                ) : (
                  p.gender
                )}
              </td>
              <td className="flex gap-2">
                <button
                  onClick={() => openEdit(p)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                {inlineId === p._id ? (
                  <>
                    <button
                      onClick={() => saveInline(p._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setInlineId(null)}
                      className="bg-gray-200 px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => startInline(p)}
                    className="bg-gray-200 px-3 py-1 rounded"
                  >
                    Quick Edit
                  </button>
                )}
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
      </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => setPage(Math.max(page - 1, 1))}
          disabled={page <= 1}
        >
          Prev
        </button>
        <span>
          Page {page} of {Math.max(Math.ceil(total / 20), 1)}
        </span>
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => setPage(Math.min(page + 1, Math.max(Math.ceil(total / 20), 1)))}
          disabled={page >= Math.max(Math.ceil(total / 20), 1)}
        >
          Next
        </button>
      </div>

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
