import { useEffect, useState } from "react";
import API from "../api/axios";
import { ErrorBanner, EmptyState } from "../components/Feedback";

export default function Notifications() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async (pageOverride) => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/notify", {
        params: { page: pageOverride || page },
      });
      setNotes(res.data.data || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || pageOverride || page);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const markRead = async (id) => {
    await API.patch(`/notify/${id}/read`);
    load(page);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Stay up to date with appointments and billing.</p>
      </div>
      <ErrorBanner message={error} />

      {loading && <div>Loading...</div>}
      {!loading && notes.length === 0 && (
        <EmptyState title="No notifications" description="You're all caught up." />
      )}

      {notes.length > 0 && (
        <div className="space-y-3">
          {notes.map((n) => (
            <div
              key={n._id}
              className={`rounded-lg border p-4 ${
                n.read ? "bg-white" : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm text-gray-600">{n.body}</div>
                </div>
                {!n.read && (
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={() => markRead(n._id)}
                  >
                    Mark Read
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
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
          Page {page} of {Math.max(Math.ceil(total / 20), 1)}
        </span>
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => load(Math.min(page + 1, Math.max(Math.ceil(total / 20), 1)))}
          disabled={page >= Math.max(Math.ceil(total / 20), 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
