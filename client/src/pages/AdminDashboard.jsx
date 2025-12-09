/* eslint-disable no-unused-vars */
/* client/src/pages/AdminDashboard.jsx */
import { useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"; // optional, install recharts if you want charts

export default function AdminDashboard() {
  // stats
  const [stats, setStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);

  // users table
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // modals
  const [editUser, setEditUser] = useState(null); // object being edited
  const [deleteUserId, setDeleteUserId] = useState(null);

  // notifications
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // loading helpers
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // fetch stats
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await API.get("/admin/stats");
      const d = res.data.data || res.data; // backend may return { data: ... } or raw
      setStats(d);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load stats");
    } finally {
      setLoadingStats(false);
    }
  };

  // fetch users with pagination & search
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await API.get("/admin/users", {
        params: { page, limit, search: search || undefined },
      });
      const payload = res.data.data || res.data; // accept both shapes
      if (Array.isArray(payload)) {
        setUsers(payload);
        setUsersTotal(res.data.total ?? payload.length);
      } else if (payload.users || payload.items) {
        // support alternative naming
        const arr = payload.users || payload.items;
        setUsers(arr);
        setUsersTotal(payload.total ?? arr.length);
      } else {
        // if backend returns directly {doctors, patients..} then we expect combined list somewhere
        setUsers(payload);
        setUsersTotal(res.data.total ?? (Array.isArray(payload) ? payload.length : 0));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  // load notifications for current logged-in admin (server should infer user by token or accept ?userId=)
  const loadNotifs = async () => {
    try {
      const res = await API.get("/notify");
      const arr = res.data.data || res.data;
      setNotifications(arr || []);
      setUnreadCount((arr || []).filter((n) => !n.isRead).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStats();
    loadUsers();
    loadNotifs();

    const iv = setInterval(() => {
      loadNotifs(); // poll
    }, 12000);

    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // re-search when search changes (debounce if needed)
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      loadUsers();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // MARK NOTIFICATION AS READ
  const markNotifRead = async (id) => {
    try {
      await API.put(`/notify/${id}/read`);
      toast.success("Marked");
      loadNotifs();
    } catch {
      toast.error("Failed to mark");
    }
  };

  // EDIT USER
  const openEdit = (user) => setEditUser({ ...user });
  const closeEdit = () => setEditUser(null);

  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const id = editUser._id || editUser.id;
      const payload = { name: editUser.name, email: editUser.email, role: editUser.role };
      const res = await API.put(`/admin/users/${id}`, payload);
      toast.success("User updated");
      closeEdit();
      loadUsers();
      loadStats();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // DELETE USER
  const confirmDelete = (id) => setDeleteUserId(id);
  const cancelDelete = () => setDeleteUserId(null);

  const doDelete = async () => {
    if (!deleteUserId) return;
    setDeleting(true);
    try {
      await API.delete(`/admin/users/${deleteUserId}`);
      toast.success("User deleted");
      setDeleteUserId(null);
      loadUsers();
      loadStats();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // derived table data (filter already done server-side but keep safe)
  const shownUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users;
  }, [users]);

  // chart data (optional)
  // expected shape: stats.appointmentsByMonth = [{ month: "Jan", count: 12 }, ...]
  const chartData = stats.appointmentsByMonth || null;

  return (
    <div className="pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

        {/* notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((s) => !s)}
            className="flex items-center gap-2 px-3 py-1 border rounded"
          >
            🔔
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1">{unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-96 max-h-80 overflow-auto bg-white border rounded shadow z-50 p-3">
              <div className="font-semibold mb-2">Notifications</div>
              {notifications.length === 0 && <div className="text-sm text-gray-500">No notifications</div>}
              {notifications.map((n) => (
                <div key={n._id} className={`p-2 rounded mb-2 ${n.isRead ? "bg-gray-50" : "bg-white"}`}>
                  <div className="flex justify-between items-start">
                    <div className="text-sm">{n.message}</div>
                    {!n.isRead && (
                      <button
                        className="text-xs text-blue-600 ml-2"
                        onClick={() => markNotifRead(n._id)}
                      >
                        Mark
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              ))}
              <div className="text-center mt-2">
                <button
                  className="text-sm text-blue-600"
                  onClick={() => {
                    setNotifOpen(false);
                    toast("Open notifications page if you have one");
                  }}
                >
                  View all
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <div className="text-sm text-gray-500">Doctors</div>
          <div className="text-3xl font-bold">{loadingStats ? "…" : stats.doctors ?? 0}</div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <div className="text-sm text-gray-500">Patients</div>
          <div className="text-3xl font-bold">{loadingStats ? "…" : stats.patients ?? 0}</div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <div className="text-sm text-gray-500">Appointments</div>
          <div className="text-3xl font-bold">{loadingStats ? "…" : stats.appointments ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* left: users table */}
        <div className="col-span-2 bg-white p-4 rounded-xl shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Users</h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by name or email..."
                className="border p-2 rounded"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loadingUsers ? (
                  <tr><td colSpan="4" className="p-4">Loading users...</td></tr>
                ) : shownUsers.length === 0 ? (
                  <tr><td colSpan="4" className="p-4 text-gray-500">No users found</td></tr>
                ) : shownUsers.map((u) => (
                  <tr key={u._id || u.id} className="odd:bg-white even:bg-gray-50">
                    <td className="p-2 border">{u.name}</td>
                    <td className="p-2 border">{u.email}</td>
                    <td className="p-2 border">{u.role ?? (u.isAdmin ? "admin" : u.role)}</td>
                    <td className="p-2 border">
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                          onClick={() => openEdit(u)}
                        >
                          Edit
                        </button>

                        <button
                          className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                          onClick={() => confirmDelete(u._id || u.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">Total: {usersTotal}</div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => { setPage((p) => Math.max(1, p - 1)); }}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <div>Page {page}</div>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* right: recent + chart */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-3">Recent Activity</h3>

          {loadingStats ? (
            <div>Loading...</div>
          ) : (
            <>
              {Array.isArray(stats.recentAppointments) && stats.recentAppointments.length > 0 ? (
                <div className="space-y-2">
                  {stats.recentAppointments.map((a) => (
                    <div key={a._id} className="p-2 border rounded">
                      <div className="font-medium">
                        {a.patient?.name ?? a.patientName} — {a.doctor?.name ?? a.doctorName}
                      </div>
                      <div className="text-sm text-gray-500">{a.date} {a.time}</div>
                      <div className="text-xs mt-1">{a.reason ?? ""}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No recent activity</div>
              )}

              {/* chart (optional, show only if data provided) */}
              {chartData ? (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Appointments / month</h4>
                  <div style={{ width: "100%", height: 200 }}>
                    <ResponsiveContainer>
                      <LineChart data={chartData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 mt-3">No chart data available (provide appointmentsByMonth in /admin/stats)</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ---------- Edit Modal ---------- */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-5">
            <h3 className="font-semibold mb-3">Edit User</h3>

            <div className="space-y-2">
              <div>
                <label className="text-sm block mb-1">Name</label>
                <input className="w-full border p-2 rounded" value={editUser.name || ""} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} />
              </div>

              <div>
                <label className="text-sm block mb-1">Email</label>
                <input className="w-full border p-2 rounded" value={editUser.email || ""} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
              </div>

              <div>
                <label className="text-sm block mb-1">Role</label>
                <select className="w-full border p-2 rounded" value={editUser.role || "patient"} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button className="px-3 py-1 border rounded" onClick={closeEdit}>Cancel</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={saveEdit} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Delete Confirm Modal ---------- */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-5">
            <h4 className="font-semibold mb-2">Confirm Delete</h4>
            <p className="text-sm text-gray-600">Are you sure you want to delete this user? This action cannot be undone.</p>

            <div className="flex justify-end gap-3 mt-4">
              <button className="px-3 py-1 border rounded" onClick={cancelDelete}>Cancel</button>
              <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={doDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
