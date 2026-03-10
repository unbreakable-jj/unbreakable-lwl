import { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStories, Story } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Plus, X, Trash2, MoreVertical, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { StoryEditor } from './StoryEditor';
import { StoryTextOverlay, TextOverlayData } from './StoryTextOverlay';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function StoriesSection() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { groupedStories, createStory, deleteStory, loading } = useStories();
  const [showCreate, setShowCreate] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [activeUserIndex, setActiveUserIndex] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const storyVideoRef = useRef<HTMLVideoElement>(null);
  const progressTimerRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const STORY_DURATION = 5000;

  // Progress bar timer
  useEffect(() => {
    if (!showViewer || isPaused) return;
    const currentStory = groupedStories[activeUserIndex]?.stories[activeStoryIndex];
    if (currentStory?.video_url) return; // video controls its own progress

    setProgress(0);
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(1, elapsed / STORY_DURATION);
      setProgress(pct);
      if (pct >= 1) {
        nextStory();
      } else {
        progressTimerRef.current = requestAnimationFrame(tick);
      }
    };
    progressTimerRef.current = requestAnimationFrame(tick);
    return () => {
      if (progressTimerRef.current) cancelAnimationFrame(progressTimerRef.current);
    };
  }, [showViewer, activeUserIndex, activeStoryIndex, isPaused]);

  const handlePublishStory = async (data: {
    content: string | null;
    image_url: string | null;
    video_url: string | null;
    visibility: string;
    text_overlays: TextOverlayData[];
    background_color: string | null;
  }) => {
    const { error } = await createStory({
      content: data.content,
      image_url: data.image_url,
      video_url: data.video_url,
      visibility: data.visibility,
      text_overlays: data.text_overlays,
      background_color: data.background_color,
    });

    if (error) {
      toast.error('Failed to create story');
    } else {
      toast.success('Story added!');
      setShowCreate(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    setDeleting(true);
    const { error } = await deleteStory(storyId);
    setDeleting(false);
    if (error) {
      toast.error('Failed to delete story');
    } else {
      toast.success('Story deleted');
      const currentUserStories = groupedStories[activeUserIndex]?.stories || [];
      if (currentUserStories.length <= 1) {
        if (groupedStories.length <= 1) {
          setShowViewer(false);
        } else if (activeUserIndex < groupedStories.length - 1) {
          setActiveStoryIndex(0);
        } else {
          setActiveUserIndex(prev => prev - 1);
          setActiveStoryIndex(0);
        }
      } else if (activeStoryIndex >= currentUserStories.length - 1) {
        setActiveStoryIndex(prev => Math.max(0, prev - 1));
      }
    }
  };

  const openViewer = (userIndex: number) => {
    setActiveUserIndex(userIndex);
    setActiveStoryIndex(0);
    setShowViewer(true);
    setIsPaused(false);
    setProgress(0);
  };

  const nextStory = useCallback(() => {
    const currentUserStories = groupedStories[activeUserIndex]?.stories || [];
    if (activeStoryIndex < currentUserStories.length - 1) {
      setActiveStoryIndex(prev => prev + 1);
      setProgress(0);
    } else if (activeUserIndex < groupedStories.length - 1) {
      setActiveUserIndex(prev => prev + 1);
      setActiveStoryIndex(0);
      setProgress(0);
    } else {
      setShowViewer(false);
    }
  }, [activeUserIndex, activeStoryIndex, groupedStories]);

  const prevStory = useCallback(() => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (activeUserIndex > 0) {
      setActiveUserIndex(prev => prev - 1);
      const prevUserStories = groupedStories[activeUserIndex - 1]?.stories || [];
      setActiveStoryIndex(prevUserStories.length - 1);
      setProgress(0);
    }
  }, [activeUserIndex, activeStoryIndex, groupedStories]);

  // Tap left/right for navigation, swipe down to close
  const handleViewerTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setIsPaused(true);
  };

  const handleViewerTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (!touchStartRef.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Swipe down to close
    if (dy > 80 && Math.abs(dx) < 50) {
      setShowViewer(false);
      return;
    }

    // Tap - determine left/right half
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      const screenWidth = window.innerWidth;
      if (endX < screenWidth / 3) {
        prevStory();
      } else {
        nextStory();
      }
    }
  };

  // Desktop click left/right
  const handleViewerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-story-controls]')) return;
    const screenWidth = window.innerWidth;
    if (e.clientX < screenWidth / 3) {
      prevStory();
    } else {
      nextStory();
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const currentUserGroup = groupedStories[activeUserIndex];
  const currentStory = currentUserGroup?.stories[activeStoryIndex];
  const isOwnStory = currentStory?.user_id === user?.id;

  const getStoryOverlays = (story: Story): TextOverlayData[] => {
    try {
      const overlays = (story as any).text_overlays;
      if (Array.isArray(overlays)) return overlays;
      return [];
    } catch { return []; }
  };

  const getStoryBgColor = (story: Story): string | null => {
    return (story as any).background_color || null;
  };

  return (
    <>
      {/* Stories Row - Circular avatars */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {user && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowCreate(true); }}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/40 group-hover:border-primary transition-colors overflow-hidden">
                <Avatar className="w-full h-full">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-display text-sm">
                    {getInitials(profile?.display_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Plus className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-display tracking-wide">
              YOUR STORY
            </span>
          </button>
        )}

        {groupedStories.map((group, index) => (
          <button
            key={group.userId}
            onClick={() => openViewer(index)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
          >
            <div className="p-[2px] rounded-full bg-gradient-to-br from-primary via-orange-400 to-pink-500">
              <div className="w-[60px] h-[60px] rounded-full border-2 border-background overflow-hidden">
                <Avatar className="w-full h-full">
                  <AvatarImage src={group.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-card text-foreground font-display text-sm">
                    {getInitials(group.profile?.display_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground truncate max-w-16">
              {group.userId === user?.id ? 'My Story' : (group.profile?.display_name?.split(' ')[0] || 'User')}
            </span>
          </button>
        ))}

        {loading && (
          <div className="flex items-center justify-center w-16 h-16">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Story Editor */}
      {showCreate && (
        <StoryEditor
          onPublish={handlePublishStory}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Full-screen Story Viewer - Instagram style */}
      <AnimatePresence>
        {showViewer && currentStory && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black"
            onClick={handleViewerClick}
            onTouchStart={handleViewerTouchStart}
            onTouchEnd={handleViewerTouchEnd}
          >
            {/* Progress bars at top */}
            <div className="absolute top-[env(safe-area-inset-top,8px)] left-2 right-2 flex gap-1 z-20 pt-2">
              {currentUserGroup.stories.map((_, idx) => (
                <div key={idx} className="flex-1 h-[2px] rounded-full bg-white/25 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-none"
                    style={{
                      width: idx < activeStoryIndex ? '100%' : idx === activeStoryIndex
                        ? (currentStory.video_url ? '0%' : `${progress * 100}%`)
                        : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div
              data-story-controls
              className="absolute top-[calc(env(safe-area-inset-top,8px)+16px)] left-3 right-3 flex items-center justify-between z-20"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={currentUserGroup.profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-white/10 text-white text-xs">
                      {getInitials(currentUserGroup.profile?.display_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="text-white text-sm font-medium leading-none">
                    {currentUserGroup.profile?.display_name || 'User'}
                  </p>
                  <p className="text-white/50 text-[10px]">
                    {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1" data-story-controls>
                {isOwnStory && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => handleDeleteStory(currentStory.id)}
                        disabled={deleting}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deleting ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10"
                  onClick={(e) => { e.stopPropagation(); setShowViewer(false); }}
                  data-story-controls
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Story Content - full screen */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: getStoryBgColor(currentStory) || '#1C1C1E',
              }}
            >
              {/* Video */}
              {currentStory.video_url && (
                <div className="absolute inset-0">
                  <video
                    ref={storyVideoRef}
                    src={currentStory.video_url}
                    className="w-full h-full object-cover"
                    autoPlay loop muted={isMuted} playsInline
                    onEnded={nextStory}
                  />
                  <div className="absolute bottom-6 right-4 flex gap-2 z-10" data-story-controls>
                    <button
                      className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (storyVideoRef.current) {
                          if (isPlaying) storyVideoRef.current.pause();
                          else storyVideoRef.current.play();
                          setIsPlaying(!isPlaying);
                        }
                      }}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (storyVideoRef.current) {
                          storyVideoRef.current.muted = !isMuted;
                          setIsMuted(!isMuted);
                        }
                      }}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Image */}
              {currentStory.image_url && !currentStory.video_url && (
                <img
                  src={currentStory.image_url}
                  alt="Story"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Text overlays */}
              {getStoryOverlays(currentStory).map(overlay => (
                <StoryTextOverlay key={overlay.id} overlay={overlay} />
              ))}

              {/* Legacy text */}
              {currentStory.content && getStoryOverlays(currentStory).length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <p className="text-white text-xl text-center font-display tracking-wide">
                    {currentStory.content}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
