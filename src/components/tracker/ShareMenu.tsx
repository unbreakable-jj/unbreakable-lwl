import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Share2, Facebook, Copy, Check, ExternalLink, BookImage } from 'lucide-react';
import { toast } from 'sonner';
import { RunWithProfile } from '@/hooks/useRuns';
import { PostWithProfile } from '@/hooks/usePosts';

// Custom icons for Instagram and TikTok
const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface WorkoutShare {
  day_name: string;
  session_type: string;
  duration_seconds: number | null;
}

interface ShareMenuProps {
  run?: RunWithProfile;
  post?: PostWithProfile;
  workout?: WorkoutShare;
  hasMedia?: boolean;
  onShareToStory?: () => void;
}

export function ShareMenu({ run, post, workout, hasMedia, onShareToStory }: ShareMenuProps) {
  const [copied, setCopied] = useState(false);

  const formatRunStats = () => {
    if (!run) return '';
    const distance = run.distance_km.toFixed(2);
    const hours = Math.floor(run.duration_seconds / 3600);
    const mins = Math.floor((run.duration_seconds % 3600) / 60);
    const secs = run.duration_seconds % 60;
    const time = hours > 0 
      ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;
    
    return `🏃 ${distance}km in ${time}`;
  };

  const formatWorkoutDuration = () => {
    if (!workout?.duration_seconds) return '';
    const secs = workout.duration_seconds;
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    const time = hours > 0
      ? `${hours}:${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${mins}:${seconds.toString().padStart(2, '0')}`;
    return `⏱️ ${time}`;
  };

  const getShareText = () => {
    if (run) {
      const stats = formatRunStats();
      const title = run.title || 'My Run';
      return `${title}\n${stats}\n\n#UNBREAKABLE #LiveWithoutLimits #Running`;
    }
    
    if (post) {
      const content = post.content ? post.content.slice(0, 200) : '';
      return `${content}\n\n#UNBREAKABLE #LiveWithoutLimits`;
    }

    if (workout) {
      const duration = formatWorkoutDuration();
      return `💪 ${workout.day_name} – ${workout.session_type}${duration ? `\n${duration}` : ''}\n\n#UNBREAKABLE #LiveWithoutLimits #Fitness`;
    }
    
    return '#UNBREAKABLE #LiveWithoutLimits';
  };

  const getShareUrl = () => {
    return 'https://unbreakable-lwl.lovable.app/tracker';
  };

  const handleCopyLink = async () => {
    const text = `${getShareText()}\n\n${getShareUrl()}`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(getShareUrl());
    const quote = encodeURIComponent(getShareText());
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(getShareUrl());
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const handleInstagramShare = async () => {
    const text = `${getShareText()}\n\n${getShareUrl()}`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied! Open Instagram and paste in your story or post.');
      window.open('https://www.instagram.com/', '_blank');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleTikTokShare = async () => {
    const text = `${getShareText()}\n\n${getShareUrl()}`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied! Open TikTok and paste in your video caption.');
      window.open('https://www.tiktok.com/', '_blank');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: run?.title || 'My Post',
          text: getShareText(),
          url: getShareUrl(),
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Share2 className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {hasNativeShare && (
          <>
            <DropdownMenuItem onClick={handleNativeShare}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Share...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {hasMedia && onShareToStory && (
          <>
            <DropdownMenuItem onClick={onShareToStory}>
              <BookImage className="w-4 h-4 mr-2" />
              Share to Story
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={handleFacebookShare}>
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleTwitterShare}>
          <TwitterIcon />
          <span className="ml-2">X (Twitter)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleInstagramShare}>
          <InstagramIcon />
          <span className="ml-2">Instagram</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleTikTokShare}>
          <TikTokIcon />
          <span className="ml-2">TikTok</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <Check className="w-4 h-4 mr-2 text-primary" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
