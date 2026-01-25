import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Calculator, Activity, User, LogOut, Settings, Brain, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthModal } from '@/components/tracker/AuthModal';

interface NavigationDrawerProps {
  variant?: 'default' | 'minimal';
}

export function NavigationDrawer({ variant = 'default' }: NavigationDrawerProps) {
  const [open, setOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const navLinks = [
    { to: '/', label: 'HOME', icon: Home },
    { to: '/calculators', label: 'CALCULATORS', icon: Calculator },
    { to: '/programming', label: 'PROGRAMMING', icon: Sparkles },
    { to: '/tracker', label: 'CARDIO CENTRAL', icon: Activity },
    { to: '/mindset', label: 'MINDSET', icon: Brain },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = () => setOpen(false);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant={variant === 'minimal' ? 'ghost' : 'outline'}
            size="icon"
            className="relative z-50"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 bg-card border-border">
          <SheetHeader className="text-left">
            <SheetTitle className="font-display text-xl tracking-wide text-foreground">
              MENU
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-full py-6">
            {/* User Section */}
            {user ? (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                    <AvatarFallback className="bg-primary text-primary-foreground font-display text-lg">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-display text-foreground tracking-wide">
                      {profile?.display_name || 'Runner'}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Separator className="bg-border" />
              </div>
            ) : (
              <div className="mb-6">
                <Button
                  className="w-full font-display tracking-wide"
                  onClick={() => {
                    setOpen(false);
                    setShowAuthModal(true);
                  }}
                >
                  SIGN IN
                </Button>
                <Separator className="bg-border mt-6" />
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex-1 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-display tracking-wide transition-all ${
                    isActive(link.to)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* User Actions */}
            {user && (
              <div className="mt-auto pt-6">
                <Separator className="bg-border mb-6" />
                <div className="space-y-2">
                  <Link
                    to="/tracker"
                    onClick={handleNavClick}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-display tracking-wide text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    <User className="w-5 h-5" />
                    MY PROFILE
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-display tracking-wide text-destructive hover:bg-destructive/10 transition-all w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    SIGN OUT
                  </button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
