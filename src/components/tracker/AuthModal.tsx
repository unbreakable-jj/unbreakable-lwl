import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync mode when defaultMode changes
  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          console.error('Sign in error:', error);
          toast.error(error.message || 'Failed to sign in. Please try again.');
        } else {
          toast.success('Welcome back!');
          onClose();
        }
      } else {
        if (!fullName.trim()) {
          toast.error('Please enter your full name');
          setLoading(false);
          return;
        }
        
        // Validate password length
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, fullName);
        if (error) {
          console.error('Sign up error:', error);
          // Provide more helpful error messages
          if (error.message?.includes('already registered')) {
            toast.error('This email is already registered. Try signing in instead.');
          } else if (error.message?.includes('password')) {
            toast.error('Password issue: ' + error.message);
          } else {
            toast.error(error.message || 'Failed to create account. Please try again.');
          }
        } else {
          toast.success('Account created! Welcome to the movement.');
          onClose();
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide text-center">
            {mode === 'signin' ? 'WELCOME BACK' : 'JOIN THE MOVEMENT'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-muted-foreground">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 bg-input border-border"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-input border-border"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" className="w-full font-display tracking-wide" disabled={loading}>
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-primary hover:underline font-semibold"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
