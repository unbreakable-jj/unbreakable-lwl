import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';
import { useSubscription } from '@/hooks/useSubscription';
import { UnifiedFeed } from '@/components/hub/UnifiedFeed';
import { CardioTrackerModal } from '@/components/tracker/CardioTrackerModal';
import { RecordActionMenu } from '@/components/hub/RecordActionMenu';
import { AuthModal } from '@/components/tracker/AuthModal';
import { MotivationalPopup } from '@/components/MotivationalPopup';

import { UserSearchModal } from '@/components/tracker/UserSearchModal';
import { FriendRequestsModal } from '@/components/tracker/FriendRequestsModal';
import { FriendsListModal } from '@/components/tracker/FriendsListModal';
import { SocialHeader } from '@/components/hub/SocialHeader';
import { usePresence } from '@/hooks/usePresence';
import { LandingPage } from '@/components/landing/LandingPage';
import { Home, User, Plus } from 'lucide-react';

type Tab = 'feed' | 'messages' | 'notifications';

// Unified Hub - Facebook-style social application
const Index = () => {
  const { user, loading } = useAuth();
  const { needsOnboarding, loading: onboardingLoading } = useOnboardingCheck();
  const { refresh: refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'signin' | 'signup'>('signin');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const hasShownMotivation = useRef(false);
  // Initialize presence tracking
  usePresence();

  // Handle checkout success redirect - refresh subscription with retries
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast.success('Welcome to UNBREAKABLE! Your 7-day free trial has started. 💪');
      setSearchParams({}, { replace: true });
      // Retry subscription check to give Stripe time to finalize
      const retryDelays = [1000, 3000, 6000];
      retryDelays.forEach((delay) => {
        setTimeout(() => refreshSubscription(), delay);
      });
    }
  }, [searchParams, setSearchParams, refreshSubscription]);

  // Redirect to onboarding if needed
  useEffect(() => {
    if (user && !loading && !onboardingLoading && needsOnboarding) {
      navigate('/onboarding');
    }
  }, [user, loading, onboardingLoading, needsOnboarding, navigate]);

  // Show motivational popup on sign-in (once per session)
  useEffect(() => {
    if (user && !loading && !hasShownMotivation.current) {
      hasShownMotivation.current = true;
      // Small delay so the page loads first
      const t = setTimeout(() => setShowMotivation(true), 800);
      return () => clearTimeout(t);
    }
  }, [user, loading]);

  if (loading || (user && onboardingLoading)) {
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
              <Home className={`w-6 h-6 ${activeTab === 'feed' ? '' : 'text-primary'}`} />
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
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center gap-1 px-4 py-2 text-muted-foreground"
            >
              <User className="w-6 h-6 text-primary" />
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
        <MotivationalPopup 
          trigger="sign_in" 
          open={showMotivation} 
          onClose={() => setShowMotivation(false)} 
        />
      </div>
    );
  }

  // Not logged in - show landing page
  return (
    <>
      <LandingPage 
        onSignIn={() => { setAuthDefaultMode('signin'); setShowAuthModal(true); }}
        onSignUp={() => { setAuthDefaultMode('signup'); setShowAuthModal(true); }}
      />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultMode={authDefaultMode} />
    </>
  );
};

export default Index;
