import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { useAuth } from '@/hooks/useAuth';
import { UnifiedFeed } from '@/components/hub/UnifiedFeed';
import { ProfileView } from '@/components/tracker/ProfileView';
import { CardioTrackerModal } from '@/components/tracker/CardioTrackerModal';
import { RecordActionMenu } from '@/components/hub/RecordActionMenu';
import { AuthModal } from '@/components/tracker/AuthModal';
import { FriendsWidget } from '@/components/tracker/FriendsWidget';
import { UserSearchModal } from '@/components/tracker/UserSearchModal';
import { FriendRequestsModal } from '@/components/tracker/FriendRequestsModal';
import { FriendsListModal } from '@/components/tracker/FriendsListModal';
import { ThemeToggle } from '@/components/hub/ThemeToggle';
import { useFriends } from '@/hooks/useFriends';
import { Badge } from '@/components/ui/badge';
import {
  Dumbbell,
  Flame,
  Timer,
  Target,
  Heart,
  Zap,
  Brain,
  Sparkles,
  Home,
  User,
  Plus,
  UserPlus,
  Users,
  Bell,
} from 'lucide-react';
import { motion } from 'framer-motion';

type Tab = 'feed' | 'workout' | 'profile';

function FriendRequestBadge({ onClick }: { onClick: () => void }) {
  const { pendingRequests } = useFriends();
  const receivedCount = pendingRequests.filter((r) => r.type === 'received').length;

  return (
    <Button variant="ghost" size="sm" className="relative" onClick={onClick}>
      <Bell className="w-5 h-5" />
      {receivedCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
          {receivedCount}
        </Badge>
      )}
    </Button>
  );
}

// Unified Hub - Simplified navigation: Feed, Workout, Profile
const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
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

  const handleWorkoutTab = () => {
    // Open the action menu to choose between Track Run or Track Workout
    setShowActionMenu(true);
  };

  // If logged in, show the unified hub
  if (user) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 brick-texture">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <img src={logo} alt="Unbreakable" className="h-10 object-contain" />
                <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                  UNBREAKABLE
                </span>
              </Link>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="sm" onClick={() => setShowUserSearch(true)}>
                  <UserPlus className="w-5 h-5" />
                </Button>
                <FriendRequestBadge onClick={() => setShowFriendRequests(true)} />
                <Button variant="ghost" size="sm" onClick={() => setShowFriendsList(true)}>
                  <Users className="w-5 h-5" />
                </Button>
                <Button
                  size="sm"
                  className="font-display tracking-wide"
                  onClick={() => setShowActionMenu(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">TRACK</span>
                </Button>
                <NavigationDrawer variant="minimal" />
              </div>
            </div>
          </div>
        </header>

        {/* Desktop Tab Navigation - Simplified: Feed, Workout, Profile */}
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
                onClick={handleWorkoutTab}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-display tracking-wide transition-all ${
                  activeTab === 'workout'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                WORKOUT
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
              {activeTab === 'feed' && <UnifiedFeed onSignIn={() => setShowAuthModal(true)} />}
              {activeTab === 'profile' && <ProfileView />}
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-80 space-y-6">
              <FriendsWidget />
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation - Simplified: Feed, + Workout, Profile */}
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
              onClick={() => setShowActionMenu(true)}
              className="flex flex-col items-center gap-1 px-4 py-2"
            >
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center -mt-6 shadow-lg">
                <Plus className="w-7 h-7 text-primary-foreground" />
              </div>
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

        <RecordActionMenu 
          isOpen={showActionMenu} 
          onClose={() => setShowActionMenu(false)}
          onOpenRunModal={() => setShowRecordModal(true)}
        />
        <CardioTrackerModal isOpen={showRecordModal} onClose={() => setShowRecordModal(false)} />
        <UserSearchModal isOpen={showUserSearch} onClose={() => setShowUserSearch(false)} />
        <FriendRequestsModal isOpen={showFriendRequests} onClose={() => setShowFriendRequests(false)} />
        <FriendsListModal isOpen={showFriendsList} onClose={() => setShowFriendsList(false)} />
      </div>
    );
  }

  // Not logged in - show landing page
  return (
    <div className="min-h-screen bg-background brick-texture">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Unbreakable - Live Without Limits" className="h-10 object-contain" />
              <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                UNBREAKABLE
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Button
                className="font-display tracking-wide"
                onClick={() => setShowAuthModal(true)}
              >
                SIGN IN
              </Button>
              <NavigationDrawer />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Centered, Large, Dramatic */}
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
            alt="Unbreakable - Live Without Limits"
            className="h-48 md:h-64 lg:h-72 object-contain mx-auto mb-8"
          />

          {/* Dramatic title */}
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-foreground tracking-wide leading-none">
            BECOME
          </h1>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-primary tracking-wide leading-none mb-10">
            UNBREAKABLE
          </h1>

          {/* Subtitle copy */}
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-4 uppercase tracking-wide">
            Live Without Limits. Build a body to last — not just look good.
          </p>

          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Strength. Fuel. Speed. Mindset. Train with purpose, regardless of age.{' '}
            <span className="text-primary font-semibold">BUILD A BODY AND MIND THAT DON'T BREAK.</span>
          </p>

          {/* Action Button - Single CTA */}
          <div className="flex justify-center mb-10">
            <Button
              size="lg"
              className="font-display text-lg tracking-wide px-12 py-6"
              onClick={() => setShowAuthModal(true)}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              GET STARTED
            </Button>
          </div>

          {/* Tagline */}
          <p className="text-primary font-display text-2xl md:text-3xl tracking-wide">
            KEEP SHOWING UP
          </p>
        </motion.div>
      </section>

      {/* Why Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl text-primary text-center mb-4 tracking-wide">
            WHY BECOME UNBREAKABLE?
          </h2>
          <p className="text-muted-foreground text-center mb-16 text-lg uppercase tracking-wide">
            We don't train for moments. We train for decades. Keep showing up.
          </p>

          {/* Central philosophy card */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="bg-card border border-border rounded-lg p-10 text-center">
              <p className="text-muted-foreground uppercase tracking-wide text-sm mb-4">
                The Unbreakable method is built on one truth:
              </p>
              <h3 className="font-display text-3xl md:text-4xl text-foreground mb-6 tracking-wide">
                LIVE WITHOUT LIMITS
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Not a project to fix. Not a problem to solve. Your body is the vessel that carries your
                dreams, your ambitions, and everyone who depends on you. When you build it with intention —
                when you fuel it with purpose — you become unstoppable. Regardless of age.
              </p>
            </div>
          </div>

          {/* Four pillars */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Dumbbell className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-4 tracking-wide">STRENGTH</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your body is your armour. Build it to last. Strength isn't about lifting heavy once — it's
                about a foundation that carries you through life.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Flame className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-4 tracking-wide">FUEL</h3>
              <p className="text-muted-foreground leading-relaxed">
                Food is not the enemy. It's the weapon. Strategic fuel to perform, recover, and dominate
                for decades — not days.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Timer className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-4 tracking-wide">SPEED</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every finish line is a new starting point. Build speed that lasts — unbreakable endurance
                for every race, every decade.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-4 tracking-wide">MINDSET</h3>
              <p className="text-muted-foreground leading-relaxed">
                The body follows the mind. Cultivate unbreakable discipline, resilience, and the mental
                fortitude to keep showing up — every single day.
              </p>
            </div>
          </div>

          {/* Quote */}
          <div className="mt-20 max-w-3xl mx-auto">
            <blockquote className="text-center">
              <p className="text-xl md:text-2xl text-muted-foreground italic leading-relaxed">
                "We don't chase quick fixes. We build bodies and minds that don't break — at 30, at 50, at
                70. That's the Unbreakable way."
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-8">
              <Target className="w-12 h-12 text-primary mb-6" />
              <h3 className="font-display text-xl text-foreground mb-3 tracking-wide">
                AGE-ADJUSTED STANDARDS
              </h3>
              <p className="text-muted-foreground">
                Your standards adjust to your age, giving you realistic and motivating targets at every
                stage of life.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
              <Heart className="w-12 h-12 text-primary mb-6" />
              <h3 className="font-display text-xl text-foreground mb-3 tracking-wide">
                CONTEXT-AWARE CALCULATIONS
              </h3>
              <p className="text-muted-foreground">
                No more generic formulas. Get personalized results based on your body, your goals, and your
                lifestyle.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
              <Zap className="w-12 h-12 text-primary mb-6" />
              <h3 className="font-display text-xl text-foreground mb-3 tracking-wide">BUILD LONGEVITY</h3>
              <p className="text-muted-foreground">
                The goal isn't to peak for a moment. It's to build a body that performs, recovers, and
                thrives for decades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-5xl md:text-6xl text-foreground mb-4 tracking-wide">
            READY TO <span className="text-primary">LIVE WITHOUT LIMITS?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-lg">
            The goal isn't to "look good" for a moment. It's to build a body and mind that support every
            dream you have — regardless of age. Keep showing up.
          </p>
          <Button
            size="lg"
            className="font-display text-xl tracking-wide px-12 py-7"
            onClick={() => setShowAuthModal(true)}
          >
            GET STARTED
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 text-center">
        <p className="text-muted-foreground text-sm">
          © 2024 Unbreakable - Live Without Limits. All rights reserved.
        </p>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Index;
