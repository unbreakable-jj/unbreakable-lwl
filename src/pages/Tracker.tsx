import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { ActivityFeed } from '@/components/tracker/ActivityFeed';
import { StatsView } from '@/components/tracker/StatsView';
import { ProfileView } from '@/components/tracker/ProfileView';
import { RecordsView } from '@/components/tracker/RecordsView';
import { LeaderboardsView } from '@/components/tracker/LeaderboardsView';
import { CardioTrackerModal } from '@/components/tracker/CardioTrackerModal';
import { AuthModal } from '@/components/tracker/AuthModal';
import { FriendsWidget } from '@/components/tracker/FriendsWidget';
import { UserSearchModal } from '@/components/tracker/UserSearchModal';
import { FriendRequestsModal } from '@/components/tracker/FriendRequestsModal';
import { FriendsListModal } from '@/components/tracker/FriendsListModal';
import { useFriends } from '@/hooks/useFriends';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, BarChart3, Users, Trophy, Home, BarChart2, User, Plus, Medal, UserPlus, Bell, Timer } from 'lucide-react';
import { motion } from 'framer-motion';

type Tab = 'feed' | 'stats' | 'records' | 'leaderboards' | 'profile' | 'friends';

const Tracker = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [showCardioModal, setShowCardioModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, show landing page
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Minimal Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <img src={logo} alt="Live Without Limits" className="h-10 object-contain" />
                <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                  LIVE WITHOUT LIMITS
                </span>
              </Link>
              <div className="flex items-center gap-3">
                <Button
                  className="font-display tracking-wide"
                  onClick={() => setShowAuthModal(true)}
                >
                  SIGN IN
                </Button>
                <NavigationDrawer variant="minimal" />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section - Full Height, Centered */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Large centered logo */}
            <img
              src={logo}
              alt="Live Without Limits"
              className="h-40 md:h-52 object-contain mx-auto mb-8"
            />

            {/* Dramatic title */}
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-foreground tracking-wide leading-none">
              CARDIO
            </h1>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-primary tracking-wide leading-none mb-10">
              TRACKER
            </h1>

            {/* Subtitle */}
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-4 uppercase tracking-wide">
              Walk. Run. Cycle.
              <br />
              Track your movement with intention.
            </p>

            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              Minimal, focused cardio tracking. Time, distance, speed — nothing more, nothing less.
            </p>

            {/* CTA Button */}
            <Button
              size="lg"
              className="font-display text-xl tracking-wide px-12 py-7"
              onClick={() => setShowAuthModal(true)}
            >
              <Timer className="w-6 h-6 mr-2" />
              GET STARTED
            </Button>

            {/* Hashtag */}
            <p className="text-primary font-display text-2xl md:text-3xl tracking-wide mt-10">
              #MOVEINTENTIONALLY
            </p>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-6">
            <h2 className="font-display text-4xl md:text-5xl text-primary text-center mb-16 tracking-wide">
              FOCUSED TRACKING
            </h2>

            <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Timer className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-3 tracking-wide">
                  TIME
                </h3>
                <p className="text-muted-foreground">
                  Precise session timing with mindset-led countdown start
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Play className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-3 tracking-wide">
                  DISTANCE
                </h3>
                <p className="text-muted-foreground">
                  Background GPS tracking for accurate distance measurement
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-3 tracking-wide">
                  SPEED
                </h3>
                <p className="text-muted-foreground">
                  Real-time pace and speed calculations as you move
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 bg-card/50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="font-display text-5xl md:text-6xl text-foreground mb-4 tracking-wide">
              READY TO <span className="text-primary">MOVE?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-lg">
              Simple. Focused. Intentional cardio tracking.
            </p>
            <Button
              size="lg"
              className="font-display text-xl tracking-wide px-12 py-7"
              onClick={() => setShowAuthModal(true)}
            >
              START TRACKING
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-10 text-center">
          <Link to="/" className="text-muted-foreground hover:text-foreground text-sm">
            ← Back to Live Without Limits
          </Link>
        </footer>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  // Logged in dashboard
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Live Without Limits" className="h-10 object-contain" />
              <div className="hidden sm:block">
                <span className="font-display text-lg tracking-wide text-foreground">
                  LIVE WITHOUT LIMITS
                </span>
                <span className="font-display text-sm tracking-wide text-primary ml-2">
                  CARDIO TRACKER
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              {/* Friends Quick Actions */}
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => setShowUserSearch(true)}
              >
                <UserPlus className="w-5 h-5" />
              </Button>
              <FriendRequestBadge onClick={() => setShowFriendRequests(true)} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFriendsList(true)}
              >
                <Users className="w-5 h-5" />
              </Button>
              <Button
                size="sm"
                className="font-display tracking-wide"
                onClick={() => setShowCardioModal(true)}
              >
                <Timer className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">TRACK</span>
              </Button>
              <NavigationDrawer variant="minimal" />
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Tab Navigation */}
      <div className="hidden md:block container mx-auto px-6 py-6">
        <div className="flex justify-center">
          <div className="inline-flex bg-card border border-border rounded-lg p-1 gap-1">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-display tracking-wide transition-all ${
                activeTab === 'feed'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className="w-4 h-4" />
              FEED
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-display tracking-wide transition-all ${
                activeTab === 'stats'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              STATS
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-display tracking-wide transition-all ${
                activeTab === 'records'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Medal className="w-4 h-4" />
              RECORDS
            </button>
            <button
              onClick={() => setActiveTab('leaderboards')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-display tracking-wide transition-all ${
                activeTab === 'leaderboards'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Trophy className="w-4 h-4" />
              LEADERBOARDS
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-display tracking-wide transition-all ${
                activeTab === 'profile'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className="w-4 h-4" />
              PROFILE
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-6">
        <div className="flex gap-6 max-w-5xl mx-auto">
          {/* Main Content */}
          <div className="flex-1 max-w-2xl">
            {activeTab === 'feed' && (
              <ActivityFeed onSignIn={() => setShowAuthModal(true)} />
            )}
            {activeTab === 'stats' && <StatsView />}
            {activeTab === 'records' && <RecordsView />}
            {activeTab === 'leaderboards' && <LeaderboardsView />}
            {activeTab === 'profile' && <ProfileView />}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 space-y-6">
            <FriendsWidget />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              activeTab === 'feed' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-display tracking-wide">FEED</span>
          </button>
          <button
            onClick={() => setShowCardioModal(true)}
            className="flex flex-col items-center gap-1 px-4 py-2"
          >
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center -mt-6 shadow-lg">
              <Timer className="w-7 h-7 text-primary-foreground" />
            </div>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              activeTab === 'stats' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <BarChart2 className="w-6 h-6" />
            <span className="text-xs font-display tracking-wide">STATS</span>
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              activeTab === 'records' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Medal className="w-6 h-6" />
            <span className="text-xs font-display tracking-wide">RECORDS</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              activeTab === 'profile' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-display tracking-wide">PROFILE</span>
          </button>
        </div>
      </nav>

      <CardioTrackerModal
        isOpen={showCardioModal}
        onClose={() => setShowCardioModal(false)}
      />
      
      {/* Friends Modals */}
      <UserSearchModal isOpen={showUserSearch} onClose={() => setShowUserSearch(false)} />
      <FriendRequestsModal isOpen={showFriendRequests} onClose={() => setShowFriendRequests(false)} />
      <FriendsListModal isOpen={showFriendsList} onClose={() => setShowFriendsList(false)} />
    </div>
  );
};

// Friend Request Badge Component with count
function FriendRequestBadge({ onClick }: { onClick: () => void }) {
  const { pendingRequests } = useFriends();
  const receivedCount = pendingRequests.filter(r => r.type === 'received').length;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative"
      onClick={onClick}
    >
      <Bell className="w-5 h-5" />
      {receivedCount > 0 && (
        <Badge 
          variant="default" 
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground"
        >
          {receivedCount}
        </Badge>
      )}
    </Button>
  );
}

export default Tracker;
