import { useEffect, useState } from "react";
import API from "../api/axios";
import Modal from "../components/Modal";
import { ErrorBanner, EmptyState } from "../components/Feedback";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availabilityDoctor, setAvailabilityDoctor] = useState(null);
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [availabilityAppointments, setAvailabilityAppointments] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState({});
  const [inlineId, setInlineId] = useState(null);
  const [inlineForm, setInlineForm] = useState({
    specialization: "",
    phone: "",
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    specialization: "",
    phone: "",
    availabilityDays: [],
    availabilityStartTime: "",
    availabilityEndTime: "",
    slotDurationMinutes: 30,
  });

  const loadDoctors = async () => {
    try {
      setError("");
      const res = await API.get("/doctors", {
        params: { q: search || undefined, page },
      });
      setDoctors(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load doctors");
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [page, search]);

  const openAdd = () => {
    setEditMode(false);
    setForm({
      name: "",
      email: "",
      specialization: "",
      phone: "",
      availabilityDays: [],
      availabilityStartTime: "",
      availabilityEndTime: "",
      slotDurationMinutes: 30,
    });
    setOpen(true);
  };

  const openEdit = (d) => {
    setEditMode(true);
    setSelectedId(d._id);
    setForm({
      name: d.name,
      email: d.email,
      specialization: d.specialization,
      phone: d.phone,
      availabilityDays: d.availabilityDays || [],
      availabilityStartTime: d.availabilityStartTime || "",
      availabilityEndTime: d.availabilityEndTime || "",
      slotDurationMinutes: d.slotDurationMinutes || 30,
    });
    setOpen(true);
  };

  const openAvailability = (doctor) => {
    setAvailabilityDoctor(doctor);
    setAvailabilityDate("");
    setAvailabilityAppointments([]);
    setAvailabilityOpen(true);
  };

  useEffect(() => {
    const fetchAvailabilityAppointments = async () => {
      if (!availabilityDoctor || !availabilityDate) return;
      try {
        const res = await API.get("/appointments", {
          params: {
            doctor: availabilityDoctor._id,
            date: availabilityDate,
            page: 1,
            limit: 200,
          },
        });
        setAvailabilityAppointments(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAvailabilityAppointments();
  }, [availabilityDoctor, availabilityDate]);

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await API.put(`/doctors/${selectedId}`, form);
      } else {
        await API.post("/doctors", form);
      }
      setOpen(false);
      loadDoctors();
    } catch (err) {
      console.error(err);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete doctor?")) return;
    await API.delete(`/doctors/${id}`);
    loadDoctors();
  };

  const bulkDelete = async () => {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0) return;
    if (!confirm("Delete selected doctors?")) return;
    await Promise.all(ids.map((id) => API.delete(`/doctors/${id}`)));
    setSelected({});
    loadDoctors();
  };

  const startInline = (d) => {
    setInlineId(d._id);
    setInlineForm({
      specialization: d.specialization || "",
      phone: d.phone || "",
    });
  };

  const saveInline = async (id) => {
    await API.put(`/doctors/${id}`, inlineForm);
    setInlineId(null);
    loadDoctors();
  };

  const toggleDay = (day) => {
    setForm((prev) => {
      const exists = prev.availabilityDays.includes(day);
      const availabilityDays = exists
        ? prev.availabilityDays.filter((d) => d !== day)
        : [...prev.availabilityDays, day];
      return { ...prev, availabilityDays };
    });
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toMinutes = (time) => {
    if (!time || !time.includes(":")) return null;
    const [h, m] = time.split(":").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    return h * 60 + m;
  };

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const buildSlots = () => {
    if (!availabilityDoctor || !availabilityDate) return [];

    const start = toMinutes(availabilityDoctor.availabilityStartTime);
    const end = toMinutes(availabilityDoctor.availabilityEndTime);
    if (start === null || end === null || start >= end) return [];

    const day = new Date(availabilityDate).getDay();
    if (
      availabilityDoctor.availabilityDays?.length &&
      !availabilityDoctor.availabilityDays.includes(day)
    ) {
      return [];
    }

    const slotDuration = availabilityDoctor.slotDurationMinutes || 30;
    const doctorAppointments = availabilityAppointments.filter(
      (appt) =>
        appt.doctorId?._id === availabilityDoctor._id &&
        appt.date === availabilityDate &&
        ["assigned", "approved"].includes(appt.status)
    );

    const isBooked = (slotStart, slotEnd) => {
      return doctorAppointments.some((appt) => {
        const apptStart = toMinutes(appt.time);
        const apptDuration = appt.durationMinutes || 30;
        if (apptStart === null) return false;
        const apptEnd = apptStart + apptDuration;
        return slotStart < apptEnd && apptStart < slotEnd;
      });
    };

    const slots = [];
    for (let t = start; t + slotDuration <= end; t += slotDuration) {
      const slotStart = t;
      const slotEnd = t + slotDuration;
      slots.push({
        time: formatTime(slotStart),
        booked: isBooked(slotStart, slotEnd),
      });
    }
    return slots;
  };

  return (
    <div className="p-5">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add Doctor
        </button>
      </div>

      <ErrorBanner message={error} />

      <div className="flex items-center justify-between mb-3">
        <input
          className="border p-2 w-72"
          placeholder="Search doctors..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <button className="px-3 py-2 bg-gray-800 text-white rounded" onClick={bulkDelete}>
          Delete (Bulk)
        </button>
      </div>

      {doctors.length === 0 && !error && (
        <EmptyState title="No doctors" description="Doctors will appear here." />
      )}

      {doctors.length > 0 && (
      <div className="table-shell overflow-x-auto">
        <table className="table-pro">
        <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Email</th>
            <th>Specialization</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((d) => (
            <tr key={d._id}>
              <td>
                <input
                  type="checkbox"
                  checked={!!selected[d._id]}
                  onChange={(e) =>
                    setSelected((prev) => ({ ...prev, [d._id]: e.target.checked }))
                  }
                />
              </td>
              <td>{d.name}</td>
              <td>{d.email}</td>
              <td>
                {inlineId === d._id ? (
                  <input
                    className="border p-1"
                    value={inlineForm.specialization}
                    onChange={(e) =>
                      setInlineForm({ ...inlineForm, specialization: e.target.value })
                    }
                  />
                ) : (
                  d.specialization
                )}
              </td>
              <td>
                {inlineId === d._id ? (
                  <input
                    className="border p-1"
                    value={inlineForm.phone}
                    onChange={(e) =>
                      setInlineForm({ ...inlineForm, phone: e.target.value })
                    }
                  />
                ) : (
                  d.phone
                )}
              </td>
              <td className="flex gap-2">
                <button onClick={() => openEdit(d)} className="bg-green-600 text-white px-3 py-1 rounded">
                  Edit
                </button>
                <button
                  onClick={() => openAvailability(d)}
                  className="bg-gray-700 text-white px-3 py-1 rounded"
                >
                  Availability
                </button>
                {inlineId === d._id ? (
                  <>
                    <button
                      onClick={() => saveInline(d._id)}
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
                    onClick={() => startInline(d)}
                    className="bg-gray-200 px-3 py-1 rounded"
                  >
                    Quick Edit
                  </button>
                )}
                <button onClick={() => remove(d._id)} className="bg-red-600 text-white px-3 py-1 rounded">
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

      <Modal open={open} onClose={() => setOpen(false)} title={editMode ? "Edit Doctor" : "Add Doctor"}>
        <div className="flex flex-col gap-3">
          <input placeholder="Name" className="border p-2" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" className="border p-2" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Specialization" className="border p-2" value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
          <input placeholder="Phone" className="border p-2" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />

          <div className="border p-2 rounded">
            <p className="font-semibold mb-2">Availability Days</p>
            <div className="flex gap-2 flex-wrap">
              {dayLabels.map((label, idx) => (
                <label key={label} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={form.availabilityDays.includes(idx)}
                    onChange={() => toggleDay(idx)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <input
            type="time"
            placeholder="Start time"
            className="border p-2"
            value={form.availabilityStartTime}
            onChange={(e) =>
              setForm({ ...form, availabilityStartTime: e.target.value })
            }
          />
          <input
            type="time"
            placeholder="End time"
            className="border p-2"
            value={form.availabilityEndTime}
            onChange={(e) =>
              setForm({ ...form, availabilityEndTime: e.target.value })
            }
          />
          <select
            className="border p-2"
            value={form.slotDurationMinutes}
            onChange={(e) =>
              setForm({ ...form, slotDurationMinutes: Number(e.target.value) })
            }
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
          </select>

          <button onClick={handleSubmit} className="bg-blue-600 text-white py-2 rounded">
            {editMode ? "Save Changes" : "Add Doctor"}
          </button>
        </div>
      </Modal>

      <Modal
        open={availabilityOpen}
        onClose={() => setAvailabilityOpen(false)}
        title="Doctor Availability"
      >
        {availabilityDoctor && (
          <div className="flex flex-col gap-3">
            <p className="font-semibold">{availabilityDoctor.name}</p>
            <div className="text-sm text-gray-600">
              {availabilityDoctor.availabilityStartTime || "--:--"} -{" "}
              {availabilityDoctor.availabilityEndTime || "--:--"} (
              {availabilityDoctor.slotDurationMinutes || 30} min slots)
            </div>
            <input
              type="date"
              className="border p-2"
              value={availabilityDate}
              onChange={(e) => setAvailabilityDate(e.target.value)}
            />
            {availabilityDate && (
              <div className="grid grid-cols-3 gap-2">
                {buildSlots().map((slot) => (
                  <div
                    key={slot.time}
                    className={`border p-2 rounded text-center ${
                      slot.booked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {slot.time}
                  </div>
                ))}
                {buildSlots().length === 0 && (
                  <div className="text-sm text-gray-600 col-span-3">
                    No slots available for this date.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
