import { useEffect, useState } from "react";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { ErrorBanner, EmptyState } from "../components/Feedback";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [reschedule, setReschedule] = useState({});
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState({});
  const { user } = useAuth();

  const loadAppointments = async (pageOverride) => {
    if (!user) return;

    let endpoint = "/appointments";
    if (user.role === "doctor") endpoint = "/appointments/doctor";
    if (user.role === "patient") endpoint = "/appointments/mine";

    setError("");
    try {
      const res = await API.get(endpoint, {
        params:
          user.role === "admin"
            ? {
                page: pageOverride || page,
                status: statusFilter || undefined,
                date: dateFilter || undefined,
              }
            : { page: pageOverride || page },
      });
      setAppointments(res.data.data || res.data || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || pageOverride || page);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load appointments");
    }
  };

  const loadDoctors = async () => {
    if (!user || user.role !== "admin") return;
    const res = await API.get("/doctors");
    setDoctors(res.data.data || res.data || []);
  };

  useEffect(() => {
    loadAppointments(1);
    loadDoctors();
  }, [user, statusFilter, dateFilter]);

  const renderPatient = (appointment) =>
    appointment.patientId?.name || appointment.patient?.name || "—";
  const renderDoctor = (appointment) =>
    appointment.doctorId?.name || appointment.doctor?.name || "—";
  const renderDuration = (appointment) =>
    appointment.durationMinutes ? `${appointment.durationMinutes} min` : "—";

  const assignDoctor = async (appointmentId) => {
    try {
      const doctorId = assignments[appointmentId];
      if (!doctorId) {
        toast.error("Select a doctor first");
        return;
      }
      await API.patch(`/appointments/${appointmentId}/assign`, { doctorId });
      toast.success("Doctor assigned");
      loadAppointments();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Assign failed");
    }
  };

  const rescheduleAppointment = async (appointmentId) => {
    try {
      const payload = reschedule[appointmentId];
      if (!payload?.date || !payload?.time) {
        toast.error("Select date and time");
        return;
      }
      await API.patch(`/appointments/${appointmentId}/reschedule`, payload);
      toast.success("Appointment rescheduled");
      setReschedule((prev) => ({ ...prev, [appointmentId]: null }));
      loadAppointments();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reschedule failed");
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await API.patch(`/appointments/${appointmentId}/cancel`);
      toast.success("Appointment cancelled");
      loadAppointments();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cancel failed");
    }
  };

  const bulkCancel = async () => {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0) return;
    try {
      await Promise.all(ids.map((id) => API.patch(`/appointments/${id}/cancel`)));
      toast.success("Appointments cancelled");
      setSelected({});
      loadAppointments(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Bulk cancel failed");
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">All Appointments</h1>

      <ErrorBanner message={error} />

      {user?.role === "admin" && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <select
              className="border p-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="date"
              className="border p-2"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <button className="px-3 py-2 bg-gray-800 text-white rounded" onClick={bulkCancel}>
            Cancel (Bulk)
          </button>
        </div>
      )}

      {appointments.length === 0 && !error && (
        <EmptyState title="No appointments" description="Appointments will appear here." />
      )}

      {appointments.length > 0 && (
      <div className="table-shell overflow-x-auto">
        <table className="table-pro">
        <thead>
          <tr>
            {user?.role === "admin" && <th>Select</th>}
            <th>Patient</th>
            <th>Doctor</th>
            <th>Reason</th>
            <th>Date</th>
            <th>Time</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
                 </thead>
        <tbody>
          {appointments.map(a => (
            <tr key={a._id}>
              {user?.role === "admin" && (
                <td>
                  <input
                    type="checkbox"
                    checked={!!selected[a._id]}
                    onChange={(e) =>
                      setSelected((prev) => ({ ...prev, [a._id]: e.target.checked }))
                    }
                  />
                </td>
              )}
              <td>{renderPatient(a)}</td>
              <td>{renderDoctor(a)}</td>
              <td>{a.reason || "—"}</td>
              <td>{a.date}</td>
              <td>{a.time}</td>
              <td>{renderDuration(a)}</td>
              <td className="capitalize">{a.status}</td>
              <td>
                {user?.role === "admin" && (
                  <div className="flex flex-col gap-2">
                    <select
                      className="border p-1"
                      value={assignments[a._id] || a.doctorId?._id || ""}
                      onChange={(e) =>
                        setAssignments((prev) => ({
                          ...prev,
                          [a._id]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Assign doctor</option>
                      {doctors.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} ({d.specialization || "General"})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => assignDoctor(a._id)}
                      className="px-2 py-1 bg-blue-600 text-white rounded"
                    >
                      Assign
                    </button>
                  </div>
                )}

                {(user?.role === "patient" || user?.role === "admin") && (
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="date"
                        className="border p-1"
                        onChange={(e) =>
                          setReschedule((prev) => ({
                            ...prev,
                            [a._id]: {
                              ...prev[a._id],
                              date: e.target.value,
                            },
                          }))
                        }
                      />
                      <input
                        type="time"
                        className="border p-1"
                        onChange={(e) =>
                          setReschedule((prev) => ({
                            ...prev,
                            [a._id]: {
                              ...prev[a._id],
                              time: e.target.value,
                            },
                          }))
                        }
                      />
                      <select
                        className="border p-1"
                        onChange={(e) =>
                          setReschedule((prev) => ({
                            ...prev,
                            [a._id]: {
                              ...prev[a._id],
                              durationMinutes: Number(e.target.value),
                            },
                          }))
                        }
                      >
                        <option value="">Duration</option>
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                        <option value={45}>45</option>
                        <option value={60}>60</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => rescheduleAppointment(a._id)}
                        className="px-2 py-1 bg-gray-800 text-white rounded"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => cancelAppointment(a._id)}
                        className="px-2 py-1 bg-red-600 text-white rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
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
          onClick={() => loadAppointments(Math.max(page - 1, 1))}
          disabled={page <= 1}
        >
          Prev
        </button>
        <span>
          Page {page} of {Math.max(Math.ceil(total / 20), 1)}
        </span>
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => loadAppointments(Math.min(page + 1, Math.max(Math.ceil(total / 20), 1)))}
          disabled={page >= Math.max(Math.ceil(total / 20), 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
          
