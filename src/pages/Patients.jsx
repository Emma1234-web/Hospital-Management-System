import { useState } from "react";

const Patients = () => {
  const [search, setSearch] = useState("");

  const [patients, setPatients] = useState([
    { id: 1, name: "John Doe", age: 35, gender: "Male", contact: "08012345678", status: "Admitted" },
    { id: 2, name: "Jane Smith", age: 28, gender: "Female", contact: "08098765432", status: "Discharged" },
    { id: 3, name: "Michael Lee", age: 42, gender: "Male", contact: "08033445566", status: "Under Observation" },
  ]);

  const [editPatient, setEditPatient] = useState(null);
  const [form, setForm] = useState({ name: "", age: "", gender: "", contact: "", status: "" });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      setPatients(patients.filter((p) => p.id !== id));
    }
  };

  const handleEdit = (patient) => {
    setEditPatient(patient.id);
    setForm(patient);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = () => {
    setPatients(
      patients.map((p) => (p.id === editPatient ? { ...p, ...form } : p))
    );
    setEditPatient(null);
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-6">Patients</h2>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search patients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg mb-6 outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* 📋 Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">#</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Age</th>
              <th className="py-3 px-4 text-left">Gender</th>
              <th className="py-3 px-4 text-left">Contact</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((p, index) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4">{p.name}</td>
                <td className="py-2 px-4">{p.age}</td>
                <td className="py-2 px-4">{p.gender}</td>
                <td className="py-2 px-4">{p.contact}</td>
                <td className="py-2 px-4">{p.status}</td>
                <td className="py-2 px-4 text-center space-x-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✏️ Edit Modal */}
      {editPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Patient</h3>

            <div className="space-y-3">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border p-2 rounded"
              />
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option>Male</option>
                <option>Female</option>
              </select>
              <input
                type="text"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="Contact"
                className="w-full border p-2 rounded"
              />

              {/* ✅ Status Dropdown */}
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option>Admitted</option>
                <option>Discharged</option>
                <option>Under Observation</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setEditPatient(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
