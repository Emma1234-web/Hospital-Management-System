import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function PatientBilling() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [payment, setPayment] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadInvoices = async (pageOverride) => {
    setLoading(true);
    try {
      const res = await API.get("/billing/mine", {
        params: { page: pageOverride || page },
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
  }, []);

  const payInvoice = async (id) => {
    try {
      const details = payment[id] || {};
      await API.patch(`/billing/${id}/pay`, {
        paymentMethod: details.paymentMethod || "",
        transactionId: details.transactionId || "",
      });
      toast.success("Payment recorded");
      loadInvoices();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Payment failed");
    }
  };

  const printInvoice = (invoice) => {
    const win = window.open("", "print");
    if (!win) return;
    win.document.write(`
      <html><head><title>Invoice</title></head>
      <body>
        <h2>Invoice</h2>
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

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">My Billing</h1>

      {loading && <p>Loading...</p>}
      {!loading && invoices.length === 0 && <p>No invoices yet.</p>}

      {invoices.length > 0 && (
        <div className="table-shell overflow-x-auto">
        <table className="table-pro">
          <thead>
            <tr>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice._id}>
                <td>
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </td>
                <td>
                  {invoice.total?.toFixed(2)} {invoice.currency || "USD"}
                </td>
                <td className="capitalize">{invoice.status}</td>
                <td>
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-200 rounded"
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [invoice._id]: !prev[invoice._id],
                      }))
                    }
                  >
                    {expanded[invoice._id] ? "Hide" : "View"}
                  </button>
                </td>
                <td>
                  {invoice.status === "unpaid" && (
                    <div className="flex flex-col gap-2">
                      <input
                        className="border p-1"
                        placeholder="Payment method"
                        value={payment[invoice._id]?.paymentMethod || ""}
                        onChange={(e) =>
                          setPayment((prev) => ({
                            ...prev,
                            [invoice._id]: {
                              ...prev[invoice._id],
                              paymentMethod: e.target.value,
                            },
                          }))
                        }
                      />
                      <input
                        className="border p-1"
                        placeholder="Transaction ID (optional)"
                        value={payment[invoice._id]?.transactionId || ""}
                        onChange={(e) =>
                          setPayment((prev) => ({
                            ...prev,
                            [invoice._id]: {
                              ...prev[invoice._id],
                              transactionId: e.target.value,
                            },
                          }))
                        }
                      />
                      <button
                        type="button"
                        className="px-3 py-1 bg-green-600 text-white rounded"
                        onClick={() => payInvoice(invoice._id)}
                      >
                        Pay
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-200 rounded mt-2"
                    onClick={() => printInvoice(invoice)}
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

      {invoices.map((invoice) => (
        <div
          key={`${invoice._id}-details`}
          className="mt-4 bg-white p-4 rounded shadow"
          style={{ display: expanded[invoice._id] ? "block" : "none" }}
        >
          <h3 className="text-lg font-semibold mb-2">Invoice Details</h3>
          <p className="text-sm text-gray-600 mb-2">
            Status: <span className="capitalize">{invoice.status}</span>
          </p>
          {invoice.items?.length ? (
            <div className="table-shell overflow-x-auto mb-3">
            <table className="table-pro">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={`${invoice._id}-item-${idx}`}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unitPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          ) : (
            <p>No line items.</p>
          )}
          {invoice.notes && (
            <p className="text-sm text-gray-700">Notes: {invoice.notes}</p>
          )}
        </div>
      ))}

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
  );
}
