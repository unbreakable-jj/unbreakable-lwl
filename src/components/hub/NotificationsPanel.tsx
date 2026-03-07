import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const t = notification.type;
  if (t === 'coaching_feedback') return '/my-coaching';
  if (t === 'coaching_request') return '/coach';
  if (t === 'programme_updated') return '/my-coaching';
  if (t === 'friend_request' || t === 'friend_accepted') return '/';
  if (t === 'post_like' || t === 'post_comment') return '/';
  if (t === 'workout_like' || t === 'workout') return '/programming/my-programmes';
  if (t === 'run_like') return '/tracker';
  if (t === 'milestone' || t === 'trophy') return '/tracker';
  if (t === 'tier2_signup') return '/coach';
  if (t === 'adherence_alert' || t === 'athlete_skipped_session') return '/programming/my-programmes';
  if (t === 'feedback_response') return '/coach';
  if (t === 'mindset_activity_complete') return '/coach';
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
    if (!notification.read) onMarkRead(notification.id);
    if (link && onNavigate) onNavigate(link);
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -80, right: 0 }}
      dragElastic={0.1}
      onDragEnd={(_: any, info: PanInfo) => {
        if (info.offset.x < -60) onDelete(notification.id);
      }}
      className="relative"
    >
      {/* Delete indicator behind */}
      <div className="absolute inset-y-0 right-0 w-20 bg-destructive flex items-center justify-center rounded-r-lg">
        <Trash2 className="w-5 h-5 text-destructive-foreground" />
      </div>

      <motion.div
        onClick={handleClick}
        className={`p-4 border-b border-border hover:bg-muted/50 transition-colors bg-card relative ${
          !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
        } ${link ? 'cursor-pointer' : ''}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              notification.read ? 'bg-muted' : 'bg-primary/20 text-primary'
            }`}
          >
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
              {notification.title}
            </p>
            {notification.body && (
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                {notification.body}
              </p>
            )}
            <p className="text-muted-foreground text-xs mt-2">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
                className="h-8 w-8 p-0"
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const navigate = useNavigate();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } =
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
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="font-display text-xs tracking-wide">
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteAll}
                    className="font-display text-xs tracking-wide text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear all
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Swipe hint */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 bg-muted/30 border-b border-border">
                <p className="text-[10px] text-muted-foreground text-center font-display tracking-wide">
                  SWIPE LEFT TO DELETE • TAP TO VIEW
                </p>
              </div>
            )}

            {/* Content */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-display tracking-wide">NO NOTIFICATIONS</p>
                  <p className="text-xs text-muted-foreground mt-2">You're all caught up</p>
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
