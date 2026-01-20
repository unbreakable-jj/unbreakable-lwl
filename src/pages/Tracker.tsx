import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { TrackerHeader } from '@/components/tracker/TrackerHeader';
import { ActivityFeed } from '@/components/tracker/ActivityFeed';
import { StatsView } from '@/components/tracker/StatsView';
import { ProfileView } from '@/components/tracker/ProfileView';
import { RecordRunModal } from '@/components/tracker/RecordRunModal';
import { AuthModal } from '@/components/tracker/AuthModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, BarChart3, Users, Trophy, Home, Activity, BarChart2, User } from 'lucide-react';
import { motion } from 'framer-motion';

type Tab = 'feed' | 'stats' | 'profile';

const Tracker = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
        <TrackerHeader />

        {/* Hero Section */}
        <section className="py-16 md:py-24 text-center border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-display text-5xl md:text-7xl text-foreground mb-2 tracking-wide">
                RUN
              </h1>
              <h1 className="font-display text-5xl md:text-7xl text-primary mb-8 tracking-wide">
                TRACKER
              </h1>

              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg mb-4">
                Track every mile. Celebrate every stride.
                <br />
                Join the community that runs for life.
              </p>

              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                GPS tracking, performance analytics, and a supportive community — all in one place.
                Build a body that carries you confidently through every stage of life.
              </p>

              <Button
                size="lg"
                className="font-display text-lg tracking-wide px-10 py-6"
                onClick={() => setShowAuthModal(true)}
              >
                <Play className="w-5 h-5 mr-2" />
                GET STARTED
              </Button>

              <p className="text-primary font-display text-2xl md:text-3xl tracking-wide mt-8">
                #RUNFORLIFE
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 border-b border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-4xl md:text-5xl text-primary text-center mb-12 tracking-wide">
              WHY RUN WITH US?
            </h2>

            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2 tracking-wide">
                  GPS TRACKING
                </h3>
                <p className="text-muted-foreground text-sm">
                  Track your runs in real-time with accurate GPS and route mapping
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2 tracking-wide">
                  ANALYTICS
                </h3>
                <p className="text-muted-foreground text-sm">
                  Deep insights into pace, distance, and performance trends
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2 tracking-wide">
                  COMMUNITY
                </h3>
                <p className="text-muted-foreground text-sm">
                  Share runs, give kudos, and connect with fellow runners
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2 tracking-wide">
                  ACHIEVEMENTS
                </h3>
                <p className="text-muted-foreground text-sm">
                  Personal records, milestones, and training insights
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4 tracking-wide">
              READY TO <span className="text-primary">RUN?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join the Live Without Limits running community today.
            </p>
            <Button
              size="lg"
              className="font-display text-lg tracking-wide px-10 py-6"
              onClick={() => setShowAuthModal(true)}
            >
              Start Running
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 text-center">
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
      <TrackerHeader
        onRecordRun={() => setShowRecordModal(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {activeTab === 'feed' && (
            <ActivityFeed onSignIn={() => setShowAuthModal(true)} />
          )}
          {activeTab === 'stats' && <StatsView />}
          {activeTab === 'profile' && <ProfileView />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              activeTab === 'feed' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-display tracking-wide">Feed</span>
          </button>
          <button
            onClick={() => setShowRecordModal(true)}
            className="flex flex-col items-center gap-1 px-4 py-2"
          >
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center -mt-4">
              <Play className="w-6 h-6 text-primary-foreground" />
            </div>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              activeTab === 'stats' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <BarChart2 className="w-6 h-6" />
            <span className="text-xs font-display tracking-wide">Stats</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              activeTab === 'profile' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-display tracking-wide">Profile</span>
          </button>
        </div>
      </nav>

      <RecordRunModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
      />
    </div>
  );
};

export default Tracker;
