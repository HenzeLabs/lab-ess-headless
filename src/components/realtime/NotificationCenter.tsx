'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Gift,
} from 'lucide-react';
import { notificationManager, Notification } from '@/lib/realtime/websocket';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setIsVisible(false);
        setTimeout(() => onDismiss(notification.id), 300);
      },
      notification.autoClose ? 5000 : 0,
    );

    return () => clearTimeout(timer);
  }, [notification.autoClose, notification.id, onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-[hsl(var(--brand-dark))]" />;
      case 'promotion':
        return <Gift className="w-5 h-5 text-[hsl(var(--brand-dark))]" />;
      case 'order_update':
        return <ShoppingCart className="w-5 h-5 text-green-600" />;
      case 'analytics':
        return <TrendingUp className="w-5 h-5 text-[hsl(var(--brand-dark))]" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
        return 'border-l-[hsl(var(--brand))]';
      case 'promotion':
        return 'border-l-[hsl(var(--brand))]';
      case 'order_update':
        return 'border-l-green-500';
      case 'analytics':
        return 'border-l-[hsl(var(--brand))]';
      default:
        return 'border-l-gray-500';
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'info':
        return 'bg-[hsl(var(--brand))]/5';
      case 'promotion':
        return 'bg-[hsl(var(--brand))]/5';
      case 'order_update':
        return 'bg-green-50';
      case 'analytics':
        return 'bg-[hsl(var(--brand))]/5';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ duration: 0.3, type: 'spring', damping: 20 }}
          className={`relative w-80 p-4 rounded-lg shadow-lg border-l-4 ${getBorderColor()} ${getBackgroundColor()} bg-white`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">
                {notification.title}
              </p>
              <p className="text-gray-700 text-sm mt-1">
                {notification.message}
              </p>
              {notification.actionUrl && (
                <button
                  onClick={() => window.open(notification.actionUrl, '_blank')}
                  className="mt-2 text-[hsl(var(--brand-dark))] hover:text-[hsl(var(--foreground))] text-sm font-medium"
                >
                  View Details →
                </button>
              )}
              <p className="text-gray-500 text-xs mt-2">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onDismiss(notification.id), 300);
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface NotificationCenterProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  position = 'top-right',
  maxNotifications = 5,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Set up notification listeners
    const handleNewNotification = (
      event: CustomEvent<{ notification: Notification }>,
    ) => {
      const notification = event.detail.notification;
      setNotifications((prev) => {
        const newNotifications = [notification, ...prev];
        return newNotifications.slice(0, maxNotifications);
      });
    };

    const handleNotificationUpdate = (
      event: CustomEvent<{ notifications: Notification[] }>,
    ) => {
      setNotifications(event.detail.notifications.slice(0, maxNotifications));
    };

    window.addEventListener(
      'new-notification',
      handleNewNotification as EventListener,
    );
    window.addEventListener(
      'notifications-updated',
      handleNotificationUpdate as EventListener,
    );

    // Subscribe to notifications on mount
    if (!isSubscribed) {
      notificationManager.subscribe();
      setIsSubscribed(true);
    }

    return () => {
      window.removeEventListener(
        'new-notification',
        handleNewNotification as EventListener,
      );
      window.removeEventListener(
        'notifications-updated',
        handleNotificationUpdate as EventListener,
      );
    };
  }, [maxNotifications, isSubscribed]);

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    notificationManager.markAsRead(id);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 pointer-events-none`}>
      <div className="space-y-3 pointer-events-auto">
        <AnimatePresence>
          {notifications.map((notification) => (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onDismiss={handleDismissNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Test notification generator for development/testing only
export const generateDemoNotification = () => {
  // TODO: Replace with real notification system
  // This is for development testing only
  const notification: Notification = {
    id: Date.now().toString(),
    type: 'info',
    title: 'Test Notification',
    message: 'This is a test notification for development purposes.',
    timestamp: Date.now(),
    priority: 'medium',
    read: false,
    autoClose: true,
    actionUrl: undefined,
    imageUrl: undefined,
  };

  notificationManager.showNotification(notification);
};

export default NotificationCenter;
