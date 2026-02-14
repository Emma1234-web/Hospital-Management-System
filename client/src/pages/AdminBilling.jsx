import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const emptyItem = () => ({
  description: "",
  quantity: 1,
  unitPrice: 0,
});

export default function AdminBilling() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState({});
  const [form, setForm] = useState({
    patientId: "",
    appointmentId: "",
    taxRate: "",
    notes: "",
    items: [emptyItem()],
  });

  const loadInvoices = async (pageOverride) => {
    setLoading(true);
    try {
      const res = await API.get("/billing", {
        params: { page: pageOverride || page, status: statusFilter || undefined },
      });
      setInvoices(res.data.data || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || pageOverride || page);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices(1);
  }, [statusFilter]);

  const updateItem = (index, field, value) => {
    setForm((prev) => {
      const items = prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const submit = async () => {
    try {
      const payload = {
        patientId: form.patientId,
        appointmentId: form.appointmentId || undefined,
        taxRate: form.taxRate !== "" ? Number(form.taxRate) : undefined,
        notes: form.notes || undefined,
        items: form.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      };

      if (editingId) {
        await API.patch(`/billing/${editingId}`, payload);
        toast.success("Invoice updated");
      } else {
        await API.post("/billing", payload);
        toast.success("Invoice created");
      }
      setForm({
        patientId: "",
        appointmentId: "",
        taxRate: "",
        notes: "",
        items: [emptyItem()],
      });
      setEditingId(null);
      loadInvoices();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create invoice");
    }
  };

  const markVoid = async (id) => {
    try {
      await API.patch(`/billing/${id}/void`);
      loadInvoices();
    } catch {
      toast.error("Failed to void invoice");
    }
  };

  const bulkVoid = async () => {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0) return;
    try {
      await Promise.all(ids.map((id) => API.patch(`/billing/${id}/void`)));
      setSelected({});
      loadInvoices(page);
    } catch {
      toast.error("Bulk void failed");
    }
  };

  const printInvoice = (invoice) => {
    const win = window.open("", "print");
    if (!win) return;
    win.document.write(`
      <html><head><title>Invoice</title></head>
      <body>
        <h2>Invoice</h2>
        <p>Patient: ${invoice.patientId?.name || "--"}</p>
        <p>Status: ${invoice.status}</p>
        <table border="1" cellspacing="0" cellpadding="6">
          <tr><th>Description</th><th>Qty</th><th>Unit Price</th></tr>
          ${(invoice.items || [])
            .map(
              (i) =>
                `<tr><td>${i.description}</td><td>${i.quantity}</td><td>${i.unitPrice}</td></tr>`
            )
            .join("")}
        </table>
        <p>Subtotal: ${invoice.subtotal}</p>
        <p>Tax: ${invoice.tax}</p>
        <p>Total: ${invoice.total}</p>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const startEdit = (invoice) => {
    const taxRate =
      invoice.subtotal && invoice.tax
        ? Number(invoice.tax / invoice.subtotal)
        : 0;
    setForm({
      patientId: invoice.patientId?._id || invoice.patientId || "",
      appointmentId: invoice.appointmentId?._id || invoice.appointmentId || "",
      taxRate: Number.isFinite(taxRate) ? taxRate : 0,
      notes: invoice.notes || "",
      items: invoice.items?.length
        ? invoice.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }))
        : [emptyItem()],
    });
    setEditingId(invoice._id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      patientId: "",
      appointmentId: "",
      taxRate: "",
      notes: "",
      items: [emptyItem()],
    });
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Billing (Admin)</h1>
        <p className="page-subtitle">Create invoices and track payment status.</p>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">
          {editingId ? "Edit Invoice" : "Create Invoice"}
        </h2>

        <div className="grid gap-3">
          <input
            className="border p-2"
            placeholder="Patient ID"
            value={form.patientId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, patientId: e.target.value }))
            }
          />
          <input
            className="border p-2"
            placeholder="Appointment ID (optional)"
            value={form.appointmentId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, appointmentId: e.target.value }))
            }
          />

          {form.items.map((item, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-4">
              <input
                className="border p-2"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
              />
              <input
                className="border p-2"
                type="number"
                min="1"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
              />
              <input
                className="border p-2"
                type="number"
                min="0"
                step="0.01"
                placeholder="Unit Price"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-3 py-2 bg-gray-200 rounded w-full"
                  onClick={addItem}
                >
                  Add Item
                </button>
                {form.items.length > 1 && (
                  <button
                    type="button"
                    className="px-3 py-2 bg-red-100 text-red-700 rounded"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}

          <input
            className="border p-2"
            type="number"
            min="0"
            step="0.01"
            placeholder="Tax rate (e.g. 0.07)"
            value={form.taxRate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, taxRate: e.target.value }))
            }
          />
          <textarea
            className="border p-2"
            rows={3}
            placeholder="Notes"
            value={form.notes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, notes: e.target.value }))
            }
          />

          <button
            type="button"
            onClick={submit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editingId ? "Update Invoice" : "Create Invoice"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">All Invoices</h2>
        <div className="flex items-center justify-between mb-3">
          <select
            className="border p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="void">Void</option>
          </select>
          <button className="px-3 py-2 bg-gray-800 text-white rounded" onClick={bulkVoid}>
            Void (Bulk)
          </button>
        </div>
        {loading && <p>Loading...</p>}
        {!loading && invoices.length === 0 && <p>No invoices yet.</p>}

        {invoices.length > 0 && (
          <div className="table-shell overflow-x-auto">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Select</th>
                <th>Patient</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selected[invoice._id]}
                      onChange={(e) =>
                        setSelected((prev) => ({ ...prev, [invoice._id]: e.target.checked }))
                      }
                    />
                  </td>
                  <td>
                    {invoice.patientId?.name || "--"}
                  </td>
                  <td>
                    {invoice.total?.toFixed(2)} {invoice.currency || "USD"}
                  </td>
                  <td className="capitalize">{invoice.status}</td>
                  <td>
                    {invoice.paymentMethod || "--"}
                    {invoice.transactionId ? ` / ${invoice.transactionId}` : ""}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {invoice.status === "unpaid" && (
                        <button
                          type="button"
                          className="px-3 py-1 bg-gray-200 rounded"
                          onClick={() => startEdit(invoice)}
                        >
                          Edit
                        </button>
                      )}
                      <button
                        type="button"
                        className="px-3 py-1 bg-gray-200 rounded"
                        onClick={() => printInvoice(invoice)}
                      >
                        Print
                      </button>
                      {invoice.status !== "void" && (
                        <button
                          type="button"
                          className="px-3 py-1 bg-red-100 text-red-700 rounded"
                          onClick={() => markVoid(invoice._id)}
                        >
                          Void
                        </button>
                      )}
                    </div>
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
            onClick={() => loadInvoices(Math.max(page - 1, 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span>Page {page} of {Math.max(Math.ceil(total / 20), 1)}</span>
          <button
            className="px-3 py-1 bg-gray-200 rounded"
            onClick={() => loadInvoices(Math.min(page + 1, Math.max(Math.ceil(total / 20), 1)))}
            disabled={page >= Math.max(Math.ceil(total / 20), 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
