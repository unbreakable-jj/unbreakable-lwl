import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Trophy,
  Dumbbell,
  Check,
  Trash2,
} from 'lucide-react';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function getNotificationLink(notification: Notification): string | null {
  if (notification.type === 'coaching_feedback' && notification.data) {
    return '/my-coaching';
  }
  if (notification.type === 'coaching_request') {
    return '/coach';
  }
  if (notification.type === 'programme_updated') {
    return '/my-coaching';
  }
  return null;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'friend_request':
    case 'friend_accepted':
      return <UserPlus className="w-4 h-4" />;
    case 'post_like':
    case 'workout_like':
    case 'run_like':
      return <Heart className="w-4 h-4" />;
    case 'post_comment':
      return <MessageCircle className="w-4 h-4" />;
    case 'milestone':
    case 'trophy':
      return <Trophy className="w-4 h-4" />;
    case 'workout':
    case 'programme_updated':
      return <Dumbbell className="w-4 h-4" />;
    case 'coaching_feedback':
    case 'coaching_request':
      return <UserPlus className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onNavigate,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: (path: string) => void;
}) {
  const link = getNotificationLink(notification);
  const handleClick = () => {
    if (link && onNavigate) {
      if (!notification.read) onMarkRead(notification.id);
      onNavigate(link);
    }
  };
  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-border hover:bg-muted/50 transition-colors ${
        !notification.read ? 'bg-primary/5' : ''
      } ${link ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            notification.read ? 'bg-muted' : 'bg-primary/20 text-primary'
          }`}
        >
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{notification.title}</p>
          {notification.body && (
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {notification.body}
            </p>
          )}
          <p className="text-muted-foreground text-xs mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkRead(notification.id)}
              className="h-8 w-8 p-0"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(notification.id)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const navigate = useNavigate();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg tracking-wide">NOTIFICATIONS</h2>
                {unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                    onNavigate={handleNavigate}
                  />
                ))
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
