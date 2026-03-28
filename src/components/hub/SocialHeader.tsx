import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemedLogo } from '@/components/ThemedLogo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { ThemeToggle } from '@/components/hub/ThemeToggle';
import { NotificationsPanel } from '@/components/hub/NotificationsPanel';

import { useConversations } from '@/hooks/useConversations';
import { useFriends } from '@/hooks/useFriends';
import { useNotifications } from '@/hooks/useNotifications';
import {
  Home,
  MessageCircle,
  UserPlus,
  Users,
  Plus,
  Bell,
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
  const { unreadCount: messageCount } = useConversations();
  const { pendingRequests } = useFriends();
  const { unreadCount: notifCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const incomingRequestCount = pendingRequests.filter(r => r.type === 'received').length;

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-primary/15">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <ThemedLogo className="h-8 w-8" />
              <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                UNBREAKABLE
              </span>
            </Link>

            {/* Desktop Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1 bg-card/60 border border-primary/15 rounded-lg p-1">
              <button
                onClick={() => onTabChange('feed')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-display text-sm tracking-wide transition-all border ${
                  activeTab === 'feed'
                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_12px_hsl(24_100%_50%/0.35)]'
                    : 'text-muted-foreground border-primary/20 hover:text-primary hover:bg-primary/10 hover:border-primary/40'
                }`}
              >
                <Home className="w-4 h-4" />
                TIMELINE
              </button>
              <button
                onClick={() => {
                  onTabChange('messages');
                  navigate('/inbox');
                }}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-md font-display text-sm tracking-wide transition-all border ${
                  activeTab === 'messages'
                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_12px_hsl(24_100%_50%/0.35)]'
                    : 'text-muted-foreground border-primary/20 hover:text-primary hover:bg-primary/10 hover:border-primary/40'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                INBOX
                {messageCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs bg-destructive">
                    {messageCount > 99 ? '99+' : messageCount}
                  </Badge>
                )}
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />

              {/* Notification Bell */}
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className={`w-5 h-5 ${notifCount > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                {notifCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-destructive">
                    {notifCount > 9 ? '9+' : notifCount}
                  </Badge>
                )}
              </Button>
              
              {/* Mobile icons */}
              <div className="flex md:hidden items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => navigate('/inbox')}
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
                  onClick={onShowFriendRequests}
                >
                  <UserPlus className="w-5 h-5 text-primary" />
                  {incomingRequestCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-destructive">
                      {incomingRequestCount > 9 ? '9+' : incomingRequestCount}
                    </Badge>
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={onShowFriendsList}>
                  <Users className="w-5 h-5 text-primary" />
                </Button>
              </div>

              <Button variant="ghost" size="sm" onClick={onShowFriendRequests} className="hidden sm:flex relative">
                <UserPlus className="w-5 h-5 text-primary" />
                {incomingRequestCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-destructive">
                    {incomingRequestCount > 9 ? '9+' : incomingRequestCount}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={onShowFriendsList} className="hidden sm:flex">
                <Users className="w-5 h-5 text-primary" />
              </Button>
              <Link to="/inbox" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="relative">
                  <MessageCircle className="w-5 h-5 text-primary" />
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
      </header>

      {/* Notifications Dropdown Panel */}
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
