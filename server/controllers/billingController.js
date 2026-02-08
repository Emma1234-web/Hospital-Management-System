import Invoice from "../models/Invoice.js";

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const buildTotals = ({ items, taxRate, taxAmount }) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  let tax = 0;
  if (taxRate !== undefined) {
    const rate = toNumber(taxRate);
    if (rate === null || rate < 0) return null;
    tax = subtotal * rate;
  } else if (taxAmount !== undefined) {
    const amount = toNumber(taxAmount);
    if (amount === null || amount < 0) return null;
    tax = amount;
  }

  const total = subtotal + tax;
  return { subtotal, tax, total };
};

const ensureItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  const normalized = items.map((item) => ({
    description: item.description,
    quantity: toNumber(item.quantity),
    unitPrice: toNumber(item.unitPrice),
  }));

  const invalid = normalized.some(
    (item) =>
      !item.description ||
      item.quantity === null ||
      item.unitPrice === null ||
      item.quantity < 1 ||
      item.unitPrice < 0
  );

  if (invalid) return null;
  return normalized;
};

/* ===================== ADMIN ===================== */

export const createInvoice = async (req, res, next) => {
  try {
    const { patientId, appointmentId, items, taxRate, taxAmount, notes } =
      req.body;

    if (!patientId) {
      return res.status(400).json({ message: "patientId is required" });
    }

    const normalizedItems = ensureItems(items);
    if (!normalizedItems) {
      return res
        .status(400)
        .json({ message: "items must include description, quantity, unitPrice" });
    }

    const totals = buildTotals({ items: normalizedItems, taxRate, taxAmount });
    if (!totals) {
      return res.status(400).json({ message: "Invalid tax values" });
    }

    const invoice = await Invoice.create({
      patientId,
      appointmentId: appointmentId || null,
      items: normalizedItems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      notes,
      issuedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

export const getAllInvoices = async (_req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate("patientId", "name email")
      .populate("appointmentId", "date time status")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: invoices });
  } catch (err) {
    next(err);
  }
};

export const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status !== "unpaid") {
      return res
        .status(400)
        .json({ message: "Only unpaid invoices can be updated" });
    }

    const { items, taxRate, taxAmount, notes } = req.body;
    if (items !== undefined) {
      const normalizedItems = ensureItems(items);
      if (!normalizedItems) {
        return res
          .status(400)
          .json({ message: "items must include description, quantity, unitPrice" });
      }
      invoice.items = normalizedItems;
    }

    if (notes !== undefined) {
      invoice.notes = notes;
    }

    const totals = buildTotals({
      items: invoice.items,
      taxRate,
      taxAmount,
    });
    if (!totals) {
      return res.status(400).json({ message: "Invalid tax values" });
    }

    invoice.subtotal = totals.subtotal;
    invoice.tax = totals.tax;
    invoice.total = totals.total;

    await invoice.save();
    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

export const voidInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.status = "void";
    await invoice.save();

    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

/* ===================== PATIENT ===================== */

export const getMyInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ patientId: req.user._id })
      .populate("appointmentId", "date time status")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: invoices });
  } catch (err) {
    next(err);
  }
};

export const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("patientId", "name email")
      .populate("appointmentId", "date time status");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (
      req.user.role === "patient" &&
      String(invoice.patientId?._id || invoice.patientId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

export const payInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (
      req.user.role === "patient" &&
      String(invoice.patientId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (invoice.status !== "unpaid") {
      return res
        .status(400)
        .json({ message: "Only unpaid invoices can be paid" });
    }

    invoice.status = "paid";
    invoice.paidAt = new Date();
    invoice.paidBy = req.user._id;
    await invoice.save();

    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};
