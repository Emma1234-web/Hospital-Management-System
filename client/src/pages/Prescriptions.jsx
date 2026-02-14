import { useEffect, useState } from "react";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { ErrorBanner, EmptyState } from "../components/Feedback";

const emptyMed = () => ({
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
});

export default function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState({});

  const [form, setForm] = useState({
    patientId: "",
    medications: [emptyMed()],
    notes: "",
    refillsAllowed: 0,
  });

  const endpoint =
    user?.role === "admin"
      ? "/prescriptions"
      : user?.role === "doctor"
      ? "/prescriptions/doctor"
      : "/prescriptions/mine";

  const load = async (pageOverride) => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(endpoint, {
        params: {
          page: pageOverride || page,
          status: statusFilter || undefined,
        },
      });
      setPrescriptions(res.data.data || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || pageOverride || page);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    load(1);
  }, [user, statusFilter]);

  const addMedication = () => {
    setForm((prev) => ({ ...prev, medications: [...prev.medications, emptyMed()] }));
  };

  const updateMedication = (index, field, value) => {
    setForm((prev) => {
      const medications = prev.medications.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      );
      return { ...prev, medications };
    });
  };

  const removeMedication = (index) => {
    setForm((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const createPrescription = async () => {
    try {
      if (!form.patientId) {
        toast.error("Patient ID is required");
        return;
      }
      await API.post("/prescriptions", form);
      toast.success("Prescription created");
      setForm({ patientId: "", medications: [emptyMed()], notes: "", refillsAllowed: 0 });
      load(1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create prescription");
    }
  };

  const refill = async (id) => {
    try {
      await API.patch(`/prescriptions/${id}/refill`);
      toast.success("Refill recorded");
      load(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Refill failed");
    }
  };

  const bulkComplete = async () => {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0) return;
    try {
      await Promise.all(ids.map((id) => API.patch(`/prescriptions/${id}/status`, { status: "completed" })));
      toast.success("Updated");
      setSelected({});
      load(page);
    } catch {
      toast.error("Bulk update failed");
    }
  };

  const printPrescription = (p) => {
    const win = window.open("", "print");
    if (!win) return;
    win.document.write(`
      <html>
      <head><title>Prescription</title></head>
      <body>
        <h2>Prescription</h2>
        <p>Patient: ${p.patientId?.name || p.patientId}</p>
        <p>Doctor: ${p.doctorId?.name || p.doctorId}</p>
        <p>Status: ${p.status}</p>
        <h3>Medications</h3>
        <ul>
          ${(p.medications || [])
            .map(
              (m) =>
                `<li>${m.name} - ${m.dosage} - ${m.frequency} - ${m.duration}</li>`
            )
            .join("")}
        </ul>
        <p>Notes: ${p.notes || "--"}</p>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const totalPages = Math.max(Math.ceil(total / 20), 1);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Prescriptions</h1>
        <p className="page-subtitle">Create, refill, and review medication plans.</p>
      </div>

      <ErrorBanner message={error} />

      {user?.role === "doctor" && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-3">Create Prescription</h2>
          <div className="grid gap-3">
            <input
              className="border p-2"
              placeholder="Patient ID"
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            />
            {form.medications.map((med, index) => (
              <div key={index} className="grid gap-2 md:grid-cols-4">
                <input
                  className="border p-2"
                  placeholder="Medication"
                  value={med.name}
                  onChange={(e) => updateMedication(index, "name", e.target.value)}
                />
                <input
                  className="border p-2"
                  placeholder="Dosage"
                  value={med.dosage}
                  onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                />
                <input
                  className="border p-2"
                  placeholder="Frequency"
                  value={med.frequency}
                  onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                />
                <div className="flex gap-2">
                  <input
                    className="border p-2 w-full"
                    placeholder="Duration"
                    value={med.duration}
                    onChange={(e) => updateMedication(index, "duration", e.target.value)}
                  />
                  {form.medications.length > 1 && (
                    <button
                      type="button"
                      className="px-3 py-2 bg-red-100 text-red-700 rounded"
                      onClick={() => removeMedication(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" className="px-3 py-2 bg-gray-200 rounded" onClick={addMedication}>
              Add Medication
            </button>
            <textarea
              className="border p-2"
              rows={3}
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <input
              className="border p-2"
              type="number"
              min="0"
              placeholder="Refills allowed"
              value={form.refillsAllowed}
              onChange={(e) => setForm({ ...form, refillsAllowed: Number(e.target.value) })}
            />
            <button onClick={createPrescription} className="bg-blue-600 text-white px-4 py-2 rounded">
              Create
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <select
          className="border p-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {(user?.role === "admin" || user?.role === "doctor") && (
          <button onClick={bulkComplete} className="px-3 py-2 bg-gray-800 text-white rounded">
            Mark Completed (Bulk)
          </button>
        )}
      </div>

      {loading && <div>Loading...</div>}
      {!loading && prescriptions.length === 0 && (
        <EmptyState title="No prescriptions" description="Prescriptions will appear here." />
      )}

      {prescriptions.length > 0 && (
        <div className="table-shell overflow-x-auto">
          <table className="table-pro">
            <thead>
              <tr>
                {(user?.role === "admin" || user?.role === "doctor") && <th>Select</th>}
                <th>Patient</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Refills</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((p) => (
                <tr key={p._id}>
                  {(user?.role === "admin" || user?.role === "doctor") && (
                    <td>
                      <input
                        type="checkbox"
                        checked={!!selected[p._id]}
                        onChange={(e) =>
                          setSelected((prev) => ({ ...prev, [p._id]: e.target.checked }))
                        }
                      />
                    </td>
                  )}
                  <td>{p.patientId?.name || "--"}</td>
                  <td>{p.doctorId?.name || "--"}</td>
                  <td className="capitalize">{p.status}</td>
                  <td>
                    {p.refillsUsed}/{p.refillsAllowed}
                  </td>
                  <td className="flex gap-2">
                    {user?.role === "patient" && p.status === "active" && (
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded"
                        onClick={() => refill(p._id)}
                      >
                        Refill
                      </button>
                    )}
                    <button
                      className="px-3 py-1 bg-gray-200 rounded"
                      onClick={() => printPrescription(p)}
                    >
                      Print
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
          onClick={() => load(Math.max(page - 1, 1))}
          disabled={page <= 1}
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => load(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
