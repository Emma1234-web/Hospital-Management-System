/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import API from "../api/axios";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const load = async () => {
    try {
      const [rRes, pRes, dRes] = await Promise.all([API.get("/medical-records"), API.get("/patients"), API.get("/doctors")]);
      setRecords(rRes.data.data || rRes.data);
      setPatients(pRes.data.data || pRes.data);
      setDoctors(dRes.data.data || dRes.data);
    } catch {
      toast.error("Failed to load");
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
      if (current) {
        await API.put(`/medical-records/${current._id}`, data);
        toast.success("Updated");
      } else {
        await API.post("/medical-records", data);
        toast.success("Created");
      }
      setModalOpen(false); load();
    } catch {
      toast.error("Failed");
    }
  };

  const del = async () => {
    try {
      await API.delete(`/medical-records/${current._id}`);
      toast.success("Deleted");
      setConfirmOpen(false);
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Medical Records</h1>
        <button onClick={() => { setCurrent(null); setModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">Add Record</button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {records.map(r => (
          <div key={r._id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{r.patient?.name}</div>
                <div className="text-sm text-gray-600">{r.diagnosis}</div>
                <div className="text-sm text-gray-500 mt-1">{r.treatment}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => { setCurrent(r); setModalOpen(true); }} className="text-xs px-2 py-1 border rounded">Edit</button>
                <button onClick={() => { setCurrent(r); setConfirmOpen(true); }} className="text-xs px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={current ? "Edit Record" : "Add Record"}>
        <form onSubmit={submit} className="space-y-3">
          <select name="patient" defaultValue={current?.patient?._id || ""} required className="w-full p-2 border rounded">
            <option value="">Select patient</option>
            {patients.map(p => <option key={p._id} value={p._1}>{p.name}</option>)}
          </select>

          <select name="doctor" defaultValue={current?.doctor?._id || ""} required className="w-full p-2 border rounded">
            <option value="">Select doctor</option>
            {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>

          <input name="diagnosis" defaultValue={current?.diagnosis || ""} className="w-full p-2 border rounded" placeholder="Diagnosis" required />
          <input name="treatment" defaultValue={current?.treatment || ""} className="w-full p-2 border rounded" placeholder="Treatment" required />
          <textarea name="notes" defaultValue={current?.notes || ""} className="w-full p-2 border rounded" placeholder="Notes" />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1 border rounded">Cancel</button>
            <button className="px-4 py-1 bg-green-600 text-white rounded">{current ? "Save" : "Create"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={del} />
    </div>
  );
}
