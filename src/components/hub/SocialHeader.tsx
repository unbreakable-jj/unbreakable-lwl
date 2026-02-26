import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemedLogo } from '@/components/ThemedLogo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { ThemeToggle } from '@/components/hub/ThemeToggle';
import { NotificationsPanel } from '@/components/hub/NotificationsPanel';

import { useNotifications } from '@/hooks/useNotifications';
import { useConversations } from '@/hooks/useConversations';
import {
  Home,
  MessageCircle,
  Bell,
  UserPlus,
  Users,
  Plus,
  Inbox,
} from 'lucide-react';

interface SocialHeaderProps {
  activeTab: 'feed' | 'messages' | 'notifications';
  onTabChange: (tab: 'feed' | 'messages' | 'notifications') => void;
  onShowUserSearch: () => void;
  onShowFriendRequests: () => void;
  onShowFriendsList: () => void;
  onShowActionMenu: () => void;
}

export function SocialHeader({
  activeTab,
  onTabChange,
  onShowUserSearch,
  onShowFriendRequests,
  onShowFriendsList,
  onShowActionMenu,
}: SocialHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount: notificationCount } = useNotifications();
  const { unreadCount: messageCount } = useConversations();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <ThemedLogo className="h-8 w-8" />
            <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
              UNBREAKABLE
            </span>
          </Link>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-card border border-border rounded-lg p-1">
            <button
              onClick={() => onTabChange('feed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-display text-sm tracking-wide transition-all ${
                activeTab === 'feed'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Home className="w-4 h-4" />
              HOME
            </button>
            <button
              onClick={() => {
                onTabChange('messages');
                navigate('/inbox?compose=1');
              }}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-md font-display text-sm tracking-wide transition-all ${
                activeTab === 'messages'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              MESSAGES
              {messageCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs bg-destructive">
                  {messageCount > 99 ? '99+' : messageCount}
                </Badge>
              )}
            </button>
            <button
              onClick={() => {
                onTabChange('notifications');
                setShowNotifications(true);
              }}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-md font-display text-sm tracking-wide transition-all ${
                activeTab === 'notifications'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Bell className="w-4 h-4" />
              ALERTS
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs bg-destructive">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              )}
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            
            {/* Mobile notification/message icons */}
            <div className="flex md:hidden items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => navigate('/inbox?compose=1')}
              >
                <MessageCircle className="w-5 h-5 text-primary" />
                {messageCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-destructive">
                    {messageCount > 9 ? '9+' : messageCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="w-5 h-5 text-primary" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-destructive">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            </div>

            <Button variant="ghost" size="sm" onClick={onShowUserSearch} className="hidden sm:flex">
              <UserPlus className="w-5 h-5 text-primary" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onShowFriendsList} className="hidden sm:flex">
              <Users className="w-5 h-5 text-primary" />
            </Button>
            <Link to="/inbox" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="relative">
                <Inbox className="w-5 h-5 text-primary" />
                {messageCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-destructive">
                    {messageCount > 9 ? '9+' : messageCount}
                  </Badge>
                )}
              </Button>
            </Link>
            
            <Button
              size="sm"
              className="font-display tracking-wide"
              onClick={onShowActionMenu}
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">TRACK</span>
            </Button>
            <NavigationDrawer variant="minimal" />
          </div>
        </div>
      </div>

      {/* Panels */}
      <NotificationsPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </header>
  );
}
