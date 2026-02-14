import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({
    doctorId: "",
    date: "",
    time: "",
    reason: "",
    durationMinutes: 30
  });

  useEffect(() => {
    API.get("/doctors", { params: { page: 1, limit: 200 } })
      .then((res) => setDoctors(res.data.data || []))
      .catch(() => toast.error("Failed to load doctors"));
  }, []);

  const loadAvailability = async (doctorId, date) => {
    if (!doctorId || !date) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    try {
      const res = await API.get("/appointments/availability", {
        params: { doctorId, date },
      });
      setSlots(res.data.data?.slots || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load availability");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    loadAvailability(form.doctorId, form.date);
  }, [form.doctorId, form.date]);

  const submit = async () => {
    try {
      if (!form.date || !form.time || !form.reason || !form.doctorId) {
        toast.error("Please fill all fields");
        return;
      }
      await API.post("/appointments", form);
      toast.success("Appointment booked");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="surface p-6 max-w-lg">
      <h2 className="text-2xl font-semibold mb-3">Book Appointment</h2>

      <select
        className="border p-2 w-full mb-2"
        value={form.doctorId}
        onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
      >
        <option value="">Select Doctor</option>
        {doctors.map((d) => (
          <option key={d._id} value={d._id}>
            {d.name} ({d.specialization || "General"})
          </option>
        ))}
      </select>

      <input type="date" className="border p-2 w-full mb-2" onChange={e=>setForm({...form,date:e.target.value})} />
      <input
        type="time"
        className="border p-2 w-full mb-2"
        value={form.time}
        onChange={e=>setForm({...form,time:e.target.value})}
      />
      <select
        className="border p-2 w-full mb-2"
        value={form.durationMinutes}
        onChange={e=>setForm({...form,durationMinutes:Number(e.target.value)})}
      >
        <option value={15}>15 minutes</option>
        <option value={30}>30 minutes</option>
        <option value={45}>45 minutes</option>
        <option value={60}>60 minutes</option>
      </select>
      <textarea
        className="border p-2 w-full mb-2"
        placeholder="Reason for visit"
        rows={3}
        onChange={e=>setForm({...form,reason:e.target.value})}
      />

      <div className="mb-3">
        <div className="text-sm font-semibold text-gray-700 mb-2">Availability</div>
        {loadingSlots && <div className="text-sm text-gray-500">Loading slots...</div>}
        {!loadingSlots && slots.length === 0 && (
          <div className="text-sm text-gray-500">Select doctor and date to see slots.</div>
        )}
        {!loadingSlots && slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => (
              <button
                type="button"
                key={slot.time}
                disabled={slot.booked}
                onClick={() => setForm({ ...form, time: slot.time })}
                className={`px-2 py-1 rounded text-xs ${
                  slot.booked
                    ? "bg-red-100 text-red-700 cursor-not-allowed"
                    : form.time === slot.time
                    ? "bg-blue-600 text-white"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={submit} className="bg-blue-600 text-white w-full py-2 rounded">
        Book
      </button>
    </div>
  );
}
