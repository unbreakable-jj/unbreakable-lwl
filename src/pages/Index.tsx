import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemedLogo } from '@/components/ThemedLogo';
import { Button } from '@/components/ui/button';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { PageNavigation, SwipeNavigationWrapper } from '@/components/PageNavigation';
import { PageHeader } from '@/components/PageHeader';
import { ThemeToggle } from '@/components/hub/ThemeToggle';
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
import { SocialHeader } from '@/components/hub/SocialHeader';
import { usePresence } from '@/hooks/usePresence';
import {
  Dumbbell,
  Flame,
  Timer,
  Target,
  Heart,
  Brain,
  Sparkles,
  Zap,
  Home,
  User,
  Plus,
  MessageCircle,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

type Tab = 'feed' | 'messages' | 'notifications' | 'profile';

// Unified Hub - Facebook-style social application
const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);

  // Initialize presence tracking
  usePresence();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If logged in, show the unified hub
  if (user) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8">
        {/* Facebook-style Header */}
        <SocialHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onShowUserSearch={() => setShowUserSearch(true)}
          onShowFriendRequests={() => setShowFriendRequests(true)}
          onShowFriendsList={() => setShowFriendsList(true)}
          onShowActionMenu={() => setShowActionMenu(true)}
        />

        <main className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex gap-6 max-w-5xl mx-auto">
            {/* Main Content */}
            <div className="flex-1 max-w-2xl">
              {activeTab === 'feed' && (
                <UnifiedFeed 
                  onSignIn={() => setShowAuthModal(true)} 
                  onOpenMessages={() => setActiveTab('messages')}
                />
              )}
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
    <SwipeNavigationWrapper>
      <div className="min-h-screen bg-background">
        {/* Header with Theme Toggle */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link to="/" className="flex items-center gap-3">
                  <ThemedLogo />
                  <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                    UNBREAKABLE
                  </span>
                </Link>
              </div>
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

        {/* Page Navigation */}
        <div className="pt-[72px]">
          <PageNavigation />
        </div>

        {/* Hero Section - Centered, Large, Dramatic */}
        <section className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Large centered logo */}
          <ThemedLogo className="h-48 md:h-64 lg:h-72 object-contain mx-auto mb-8" />

          {/* Dramatic title */}
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-foreground tracking-wide leading-none mb-2">
            BECOME
          </h1>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-primary tracking-wide leading-none neon-glow-subtle">
            UNBREAKABLE
          </h1>
          <p className="text-primary font-display text-xl md:text-2xl tracking-wide mt-6 neon-glow-subtle">
            LIVE WITHOUT LIMITS
          </p>
          <p className="text-muted-foreground text-lg mt-4 max-w-xl mx-auto mb-8">
            Build a body and mind that don't break — at 30, at 50, at 70.
          </p>

          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Strength. Fuel. Speed. Mindset. Train with purpose, regardless of age.{' '}
            <span className="text-primary font-semibold">KEEP SHOWING UP.</span>
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
          <p className="text-primary font-display text-2xl md:text-3xl tracking-wide neon-glow-subtle">
            #UNBREAKABLEMOVEMENT
          </p>
        </motion.div>
      </section>

      {/* Why Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl text-primary text-center mb-4 tracking-wide neon-glow-subtle">
            WHY BECOME UNBREAKABLE?
          </h2>
          <p className="text-muted-foreground text-center mb-16 text-lg uppercase tracking-wide">
            We don't train for moments. We train for decades. Keep showing up.
          </p>

          {/* Central philosophy card */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="bg-card border-2 border-primary/30 neon-border-subtle rounded-lg p-10 text-center">
              <p className="text-muted-foreground uppercase tracking-wide text-sm mb-4">
                The Unbreakable method is built on one truth:
              </p>
              <h3 className="font-display text-3xl md:text-4xl text-primary mb-6 tracking-wide neon-glow-subtle">
                KEEP SHOWING UP
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Your body is the vessel that carries your dreams, your ambitions, and everyone who depends on you. 
                When you build it with intention — when you fuel it with purpose — you become unstoppable. 
                Regardless of age. <span className="text-primary font-semibold">LIVE WITHOUT LIMITS.</span>
              </p>
            </div>
          </div>

          {/* Four pillars */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 neon-border-subtle flex items-center justify-center mx-auto mb-6">
                <Dumbbell className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-primary mb-4 tracking-wide neon-glow-subtle">STRENGTH</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your body is your armour. Build it to last. Strength isn't about lifting heavy once — it's
                about a foundation that carries you through life.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 neon-border-subtle flex items-center justify-center mx-auto mb-6">
                <Flame className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-primary mb-4 tracking-wide neon-glow-subtle">FUEL</h3>
              <p className="text-muted-foreground leading-relaxed">
                Food is not the enemy. It's the weapon. Strategic fuel to perform, recover, and dominate
                for decades — not days.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 neon-border-subtle flex items-center justify-center mx-auto mb-6">
                <Timer className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-primary mb-4 tracking-wide neon-glow-subtle">SPEED</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every finish line is a new starting point. Build speed that lasts — unbreakable endurance
                for every race, every decade.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 neon-border-subtle flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-primary mb-4 tracking-wide neon-glow-subtle">MINDSET</h3>
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
          {/* Coaching Banner */}
          <Link to="/help" className="block max-w-3xl mx-auto mb-16">
            <Card className="border-2 border-primary/40 bg-primary/5 p-6 hover:bg-primary/10 transition-all neon-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center neon-glow">
                    <Flame className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-2xl tracking-wide text-foreground">
                      UNBREAKABLE <span className="text-primary neon-glow-subtle">COACHING</span>
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Your personal coach for training, nutrition, mindset, and beyond. Ask anything!
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-primary hidden sm:block" />
              </div>
            </Card>
          </Link>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card border-2 border-primary/30 neon-border-subtle rounded-lg p-8">
              <Target className="w-12 h-12 text-primary mb-6" />
              <h3 className="font-display text-xl text-primary mb-3 tracking-wide neon-glow-subtle">
                AGE-ADJUSTED STANDARDS
              </h3>
              <p className="text-muted-foreground">
                Your standards adjust to your age, giving you realistic and motivating targets at every
                stage of life.
              </p>
            </div>

            <div className="bg-card border-2 border-primary/30 neon-border-subtle rounded-lg p-8">
              <Heart className="w-12 h-12 text-primary mb-6" />
              <h3 className="font-display text-xl text-primary mb-3 tracking-wide neon-glow-subtle">
                PERSONALISED PROGRAMMING
              </h3>
              <p className="text-muted-foreground">
                No more generic formulas. Get personalised results based on your body, your goals, and your
                lifestyle.
              </p>
            </div>

            <div className="bg-card border-2 border-primary/30 neon-border-subtle rounded-lg p-8">
              <Zap className="w-12 h-12 text-primary mb-6" />
              <h3 className="font-display text-xl text-primary mb-3 tracking-wide neon-glow-subtle">BUILD LONGEVITY</h3>
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
          <h2 className="font-display text-5xl md:text-6xl text-foreground mb-2 tracking-wide">
            READY TO
          </h2>
          <h2 className="font-display text-5xl md:text-6xl text-primary mb-4 tracking-wide neon-glow-subtle">
            LIVE WITHOUT LIMITS?
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

        <UnifiedFooter />

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    </SwipeNavigationWrapper>
  );
};

export default Index;
