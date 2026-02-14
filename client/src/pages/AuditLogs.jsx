import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { ErrorBanner, EmptyState } from "../components/Feedback";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    actorId: "",
    entityId: "",
    dateFrom: "",
    dateTo: "",
  });

  const loadLogs = async (pageOverride) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        ...filters,
        page: pageOverride || page,
        limit,
      };
      const res = await API.get("/audit-logs", { params });
      setLogs(res.data.data || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || pageOverride || page);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load logs";
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1);
  }, []);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Audit Logs</h1>
        <p className="page-subtitle">Track system activity and record changes.</p>
      </div>

      <ErrorBanner message={error} />

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="border p-2"
            placeholder="Action"
            value={filters.action}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, action: e.target.value }))
            }
          />
          <input
            className="border p-2"
            placeholder="Entity Type"
            value={filters.entityType}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, entityType: e.target.value }))
            }
          />
          <input
            className="border p-2"
            placeholder="Actor ID"
            value={filters.actorId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, actorId: e.target.value }))
            }
          />
          <input
            className="border p-2"
            placeholder="Entity ID"
            value={filters.entityId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, entityId: e.target.value }))
            }
          />
          <input
            type="date"
            className="border p-2"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
            }
          />
          <input
            type="date"
            className="border p-2"
            value={filters.dateTo}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
            }
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => loadLogs(1)}
          >
            Apply Filters
          </button>
          <button
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
            onClick={() => {
              setFilters({
                action: "",
                entityType: "",
                actorId: "",
                entityId: "",
                dateFrom: "",
                dateTo: "",
              });
              loadLogs(1);
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        {loading && <p>Loading...</p>}
        {!loading && logs.length === 0 && (
          <EmptyState title="No logs found" description="Try adjusting filters." />
        )}

        {logs.length > 0 && (
          <div className="table-shell overflow-x-auto">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Actor</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>{log.action}</td>
                  <td>
                    {log.entityType} / {log.entityId}
                  </td>
                  <td>
                    {log.actorId?.name || "System"}
                  </td>
                  <td>{log.message || "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button
            className="px-3 py-1 bg-gray-200 rounded"
            onClick={() => loadLogs(Math.max(page - 1, 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="px-3 py-1 bg-gray-200 rounded"
            onClick={() => loadLogs(Math.min(page + 1, totalPages))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
