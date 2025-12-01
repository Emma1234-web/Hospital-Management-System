let notifications = [];

export const createNotification = (req, res) => {
  const { to, title, body } = req.body;
  notifications.push({ id: Date.now().toString(), to, title, body, createdAt: new Date() });
  res.status(201).json({ success: true });
};

export const getNotifications = (req, res) => {
  const user = req.user;
  const list = notifications.filter(n => n.to === user.role || n.to === user.id);
  res.json(list);
};
