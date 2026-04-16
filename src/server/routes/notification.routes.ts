import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: (req as any).user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
