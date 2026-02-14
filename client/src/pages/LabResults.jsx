import { useEffect, useState } from "react";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { ErrorBanner, EmptyState } from "../components/Feedback";

export default function LabResults() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    testName: "",
    resultText: "",
    resultFileName: "",
    resultFileType: "",
    resultFileData: "",
  });

  const endpoint =
    user?.role === "admin"
      ? "/lab-results"
      : user?.role === "doctor"
      ? "/lab-results/doctor"
      : "/lab-results/mine";

  const load = async (pageOverride) => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(endpoint, {
        params: { page: pageOverride || page, status: statusFilter || undefined },
      });
      setResults(res.data.data || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || pageOverride || page);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load lab results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    load(1);
  }, [user, statusFilter]);

  const onFileChange = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        resultFileName: file.name,
        resultFileType: file.type,
        resultFileData: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const createLabResult = async () => {
    try {
      if (!form.patientId || !form.testName) {
        toast.error("Patient ID and test name are required");
        return;
      }
      await API.post("/lab-results", form);
      toast.success("Lab result created");
      setForm({
        patientId: "",
        doctorId: "",
        testName: "",
        resultText: "",
        resultFileName: "",
        resultFileType: "",
        resultFileData: "",
      });
      load(1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create lab result");
    }
  };

  const totalPages = Math.max(Math.ceil(total / 20), 1);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Lab Results</h1>
        <p className="page-subtitle">Upload, review, and share diagnostic results.</p>
      </div>

      <ErrorBanner message={error} />

      {(user?.role === "admin" || user?.role === "doctor") && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-3">Upload Lab Result</h2>
          <div className="grid gap-3">
            <input
              className="border p-2"
              placeholder="Patient ID"
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            />
            {user?.role === "admin" && (
              <input
                className="border p-2"
                placeholder="Doctor ID (optional)"
                value={form.doctorId}
                onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
              />
            )}
            <input
              className="border p-2"
              placeholder="Test Name"
              value={form.testName}
              onChange={(e) => setForm({ ...form, testName: e.target.value })}
            />
            <textarea
              className="border p-2"
              rows={3}
              placeholder="Result Text"
              value={form.resultText}
              onChange={(e) => setForm({ ...form, resultText: e.target.value })}
            />
            <input
              type="file"
              className="border p-2"
              onChange={(e) => onFileChange(e.target.files?.[0])}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={createLabResult}
            >
              Upload
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
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading && <div>Loading...</div>}
      {!loading && results.length === 0 && (
        <EmptyState title="No lab results" description="Lab results will appear here." />
      )}

      {results.length > 0 && (
        <div className="table-shell overflow-x-auto">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Test</th>
                <th>Status</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id}>
                  <td>{r.patientId?.name || "--"}</td>
                  <td>{r.doctorId?.name || "--"}</td>
                  <td>{r.testName}</td>
                  <td className="capitalize">{r.status}</td>
                  <td>
                    {r.resultFileData ? (
                      <a
                        className="text-blue-600"
                        href={r.resultFileData}
                        download={r.resultFileName || "lab-result"}
                      >
                        Download
                      </a>
                    ) : (
                      r.resultText || "--"
                    )}
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
