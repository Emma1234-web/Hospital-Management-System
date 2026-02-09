import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res, next) => {
  try {
    const {
      action,
      entityType,
      actorId,
      entityId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;
    if (actorId) filter.actorId = actorId;
    if (entityId) filter.entityId = entityId;

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("actorId", "name email role"),
    ]);

    res.json({
      success: true,
      data: logs,
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (err) {
    next(err);
  }
};
