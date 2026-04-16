import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase";
import { toast } from "sonner";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.uid) {
      const q = query(
        collection(db, "notifications"),
        where("recipientId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as any));
        
        // Check for new notifications to show toast
        if (notifications.length > 0 && newNotifications.length > notifications.length) {
          const latest = newNotifications[0];
          if (!latest.isRead) {
            toast.info(latest.message);
          }
        }

        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter((n: any) => !n.isRead).length);
      }, (error) => {
        console.error("Notification listener error:", error);
      });

      return () => unsubscribe();
    }
  }, [user?.uid]);

  const markAsRead = async (id) => {
    try {
      const notificationRef = doc(db, "notifications", id);
      await updateDoc(notificationRef, { isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
