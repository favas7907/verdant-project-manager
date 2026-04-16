import Notification from "../models/Notification.js";

export const createNotification = async (io, data) => {
  try {
    const notification = await Notification.create(data);
    io.to(data.recipient.toString()).emit("notification", notification);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
