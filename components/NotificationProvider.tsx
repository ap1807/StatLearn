'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const id = Date.now().toString();
    const timestamp = new Date().toISOString();
    const newNotification: Notification = {
      ...n,
      id,
      timestamp,
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Send to WebSocket server to broadcast
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'ALERT',
        payload: newNotification
      }));
    }
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  useEffect(() => {
    // Connect to WebSocket server on the same port with specific path
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws`);

    socket.onopen = () => {
      console.log('Connected to notification server');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NOTIFICATION') {
          setNotifications(prev => {
            // Avoid duplicates if we're the sender (though server could handle this)
            if (prev.some(n => n.id === data.payload.id)) return prev;
            return [data.payload, ...prev];
          });
        }
      } catch (err) {
        console.error('Error parsing notification message:', err);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket client error:', error);
    };

    socket.onclose = () => {
      console.log('Disconnected from notification server');
    };

    wsRef.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, clearAll }}>
      {children}
      
      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-md w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.filter(n => !n.read).slice(0, 3).map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex gap-4 items-start ${
                n.severity === 'high' 
                  ? 'bg-error/10 border-error/20 text-error' 
                  : n.severity === 'medium'
                  ? 'bg-tertiary/10 border-tertiary/20 text-tertiary'
                  : 'bg-primary/10 border-primary/20 text-primary'
              }`}>
                <div className="p-2 rounded-xl bg-white/10 shadow-sm">
                  {n.severity === 'high' ? <AlertTriangle className="w-5 h-5" /> : n.severity === 'medium' ? <Info className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-sm mb-1">{n.title}</h4>
                  <p className="text-xs opacity-80 leading-relaxed">{n.message}</p>
                </div>
                <button 
                  onClick={() => markAsRead(n.id)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
