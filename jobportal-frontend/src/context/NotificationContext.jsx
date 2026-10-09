import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { notificationApi } from '../api/notificationApi';
import { WS_URL } from '../utils/constants';
import useAuth from '../hooks/useAuth';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch {
      // Ignore unread count failure gracefully
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await notificationApi.getMyNotifications();
      let list = Array.isArray(data) ? data : [];
      if (user?.role === 'RECRUITER' || user?.role === 'ADMIN') {
        list = list.filter((n) => n.type !== 'JOB' && !n.title?.toLowerCase().includes('job match'));
      }
      setNotifications(list);
      const unread = list.filter((n) => n.read !== true && n.isRead !== true).length;
      setUnreadCount(unread);
    } catch {
      // Ignore fetch notifications error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();

      // Poll every 15 seconds to ensure near real-time updates even if WebSocket is disconnected
      const timer = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 15000);

      return () => clearInterval(timer);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  // STOMP WebSocket client setup
  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;

    let stompClient = null;

    try {
      const token = localStorage.getItem('token');
      stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        debug: () => {},
        reconnectDelay: 15000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          // Subscribe to user notification queue/topic
          stompClient.subscribe(`/topic/notifications/${user.email}`, (message) => {
            if (message.body) {
              try {
                const newNotification = JSON.parse(message.body);
                if (
                  (user?.role === 'RECRUITER' || user?.role === 'ADMIN') &&
                  (newNotification.type === 'JOB' || newNotification.title?.toLowerCase().includes('job match'))
                ) {
                  return; // Silently ignore job matching alerts for recruiters and admins
                }
                setNotifications((prev) => [newNotification, ...prev]);
                setUnreadCount((prev) => prev + 1);
              } catch {
                fetchNotifications();
              }
            }
          });
        },
        onStompError: () => {},
        onWebSocketError: () => {},
      });

      stompClient.activate();
    } catch (e) {
      console.warn('WebSocket connection not initialized:', e);
    }

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [isAuthenticated, user?.email, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    setUnreadCount(0);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, isRead: true }))
    );
    try {
      await notificationApi.markAllAsRead();
    } catch {
      // Ignore error
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await notificationApi.markAsRead(id);
    } catch {
      // Ignore error
    }
  }, []);

  const value = React.useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    refreshNotifications: fetchNotifications,
    markAllAsRead,
    markAsRead,
  }), [notifications, unreadCount, loading, fetchNotifications, fetchUnreadCount, markAllAsRead, markAsRead]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

