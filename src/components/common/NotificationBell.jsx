import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../config/axiosInstance";
import socket from "../../config/socket";
import useAuthStore from "../../store/authStore";
import styles from "./NotificationBell.module.css";

/**
 * Surfaces the durable billing notifications stored by the backend
 * (GET /billing/notifications). Previously notifications were only pushed over
 * Socket.io as transient toasts, so anything missed while offline — a failed
 * payment, a suspension, a cancellation — was never shown to the user.
 */
const fetchNotifications = async () => {
  try {
    const res = await api.get("/billing/notifications");
    return { items: Array.isArray(res.data?.data) ? res.data.data : [], error: null };
  } catch (err) {
    return {
      items: null,
      error: err.response?.data?.message || "Could not load notifications",
    };
  }
};

export const NotificationBell = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const wrapRef = useRef(null);

  const apply = useCallback((data) => {
    if (data.error) {
      setError(data.error);
      return;
    }
    setItems(data.items);
    setError(null);
  }, []);

  const reload = useCallback(() => {
    fetchNotifications().then(apply);
  }, [apply]);

  useEffect(() => {
    if (!user?._id) return;
    fetchNotifications().then(apply);
  }, [user?._id, apply]);

  // A live socket event means the server wrote a new record — reload so the
  // unread count stays accurate even if the user never opens the panel.
  useEffect(() => {
    const onNotification = () => reload();
    socket.on("notification", onNotification);
    return () => {
      socket.off("notification", onNotification);
    };
  }, [reload]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    // Optimistic — the server call is the durable confirmation.
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.post("/billing/notifications/read");
    } catch {
      reload();
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) markAllRead();
  };

  const openItem = () => {
    setOpen(false);
    navigate("/subscriptions/manage");
  };

  if (!user?._id) return null;

  return (
    <div className={styles.bellWrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.bellButton}
        onClick={toggle}
        aria-label={unreadCount ? `Notifications (${unreadCount} unread)` : "Notifications"}
        title="Notifications"
      >
        <svg className={styles.bellIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <p className={styles.panelTitle}>Notifications</p>
            {unreadCount > 0 && (
              <button type="button" className={styles.markReadBtn} onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {!error && items.length === 0 && <div className={styles.empty}>No notifications yet</div>}

          {items.map((n) => (
            <div
              key={n._id}
              className={`${styles.item} ${n.read ? styles.itemRead : ""}`}
              onClick={openItem}
            >
              <p className={styles.itemTitle}>{n.title}</p>
              <p className={styles.itemMessage}>{n.message}</p>
              <span className={styles.itemTime}>
                {n.createdAt
                  ? new Date(n.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;