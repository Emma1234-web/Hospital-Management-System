import Invoice from "../models/Invoice.js";
import AuditLog from "../models/AuditLog.js";
import { createInAppNotification } from "../utils/notificationService.js";

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

const logAudit = async ({
  req,
  action,
  entityType,
  entityId,
  before,
  after,
  message,
}) => {
  try {
    const actorModel =
      req.user?.role === "admin"
        ? "Admin"
        : req.user?.role === "doctor"
        ? "Doctor"
        : req.user?.role === "patient"
        ? "Patient"
        : null;

    await AuditLog.create({
      actorId: req.user?._id || null,
      actorModel,
      action,
      entityType,
      entityId,
      before,
      after,
      message,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch {
    // best-effort audit logging
  }
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

    await createInAppNotification({
      title: "New Invoice",
      body: `A new invoice of ${totals.total.toFixed(2)} ${invoice.currency} was created.`,
      user: patientId,
      role: "patient",
      meta: { invoiceId: invoice._id },
    });

    await logAudit({
      req,
      action: "invoice.create",
      entityType: "invoice",
      entityId: invoice._id,
      after: {
        patientId: invoice.patientId,
        total: invoice.total,
        status: invoice.status,
      },
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

export const getAllInvoices = async (req, res, next) => {
  try {
    const { status, patient, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (patient) filter.patientId = patient;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, invoices] = await Promise.all([
      Invoice.countDocuments(filter),
      Invoice.find(filter)
        .populate("patientId", "name email")
        .populate("appointmentId", "date time status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    res.json({
      success: true,
      data: invoices,
      total,
      page: pageNum,
      limit: limitNum,
    });
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
    const before = {
      items: invoice.items,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      notes: invoice.notes,
    };

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

    await logAudit({
      req,
      action: "invoice.update",
      entityType: "invoice",
      entityId: invoice._id,
      before,
      after: {
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        total: invoice.total,
        notes: invoice.notes,
      },
    });
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

    const before = {
      status: invoice.status,
    };
    invoice.status = "void";
    await invoice.save();

    await createInAppNotification({
      title: "Invoice Voided",
      body: "Your invoice has been voided.",
      user: invoice.patientId,
      role: "patient",
      meta: { invoiceId: invoice._id },
    });

    await logAudit({
      req,
      action: "invoice.void",
      entityType: "invoice",
      entityId: invoice._id,
      before,
      after: { status: invoice.status },
    });

    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

/* ===================== PATIENT ===================== */

export const getMyInvoices = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = { patientId: req.user._id };
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, invoices] = await Promise.all([
      Invoice.countDocuments(filter),
      Invoice.find(filter)
        .populate("appointmentId", "date time status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    res.json({ success: true, data: invoices, total, page: pageNum, limit: limitNum });
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

    const { paymentMethod, transactionId } = req.body || {};

    const before = {
      status: invoice.status,
      paidAt: invoice.paidAt,
      paidBy: invoice.paidBy,
      paymentMethod: invoice.paymentMethod,
      transactionId: invoice.transactionId,
    };

    invoice.status = "paid";
    invoice.paidAt = new Date();
    invoice.paidBy = req.user._id;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (transactionId) invoice.transactionId = transactionId;
    await invoice.save();

    await createInAppNotification({
      title: "Invoice Paid",
      body: "Your invoice payment was recorded.",
      user: invoice.patientId,
      role: "patient",
      meta: { invoiceId: invoice._id },
    });

    await logAudit({
      req,
      action: "invoice.pay",
      entityType: "invoice",
      entityId: invoice._id,
      before,
      after: {
        status: invoice.status,
        paidAt: invoice.paidAt,
        paidBy: invoice.paidBy,
        paymentMethod: invoice.paymentMethod,
        transactionId: invoice.transactionId,
      },
    });

    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};
