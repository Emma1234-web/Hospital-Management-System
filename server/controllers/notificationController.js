// server/controllers/notificationController.js
import Notification from "../models/Notification.js";

/**
 * POST /api/notify/  - create a notification
 * body: { title, body, user?, role?, meta? }
 */
export const createNotification = async (req, res) => {
  try {
    const data = req.body;
    const note = await Notification.create(data);
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/notify/  - list notifications (admin can view all)
 * supports query: ?user=... or ?role=...
 */
export const getNotifications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.user) filter.user = req.query.user;
    if (req.query.role) filter.role = req.query.role;

    // if not admin, restrict to user or role==user.role
    if (req.user.role !== "admin") {
      // user sees their own or by role
      filter.$or = [{ user: req.user._id }, { role: req.user.role }];
    }

    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, notes] = await Promise.all([
      Notification.countDocuments(filter),
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .populate("user", "name email")
        .skip(skip)
        .limit(limitNum),
    ]);
    res.json({ success: true, data: notes, total, page: pageNum, limit: limitNum });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/notify/:id/read  - mark as read
 */
export const markAsRead = async (req, res) => {
  try {
    const note = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!note) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const deleteNotification = async (req, res) => {
  try {
    const note = await Notification.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
