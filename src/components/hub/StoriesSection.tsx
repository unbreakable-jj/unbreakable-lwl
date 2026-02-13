import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useStories, Story } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Plus, X, ChevronLeft, ChevronRight, Trash2, MoreVertical, Play, Pause, Volume2, VolumeX } from 'lucide-react';
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
  const { groupedStories, createStory, deleteStory, loading, refetch } = useStories();
  const [showCreate, setShowCreate] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [activeUserIndex, setActiveUserIndex] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const storyVideoRef = useRef<HTMLVideoElement>(null);

  // Auto-progress for story viewer (only for image/text stories)
  useEffect(() => {
    if (!showViewer) return;
    const currentStory = groupedStories[activeUserIndex]?.stories[activeStoryIndex];
    if (currentStory?.video_url) return;
    const timer = setTimeout(() => { nextStory(); }, 5000);
    return () => clearTimeout(timer);
  }, [showViewer, activeUserIndex, activeStoryIndex]);

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
  };

  const nextStory = () => {
    const currentUserStories = groupedStories[activeUserIndex]?.stories || [];
    if (activeStoryIndex < currentUserStories.length - 1) {
      setActiveStoryIndex((prev) => prev + 1);
    } else if (activeUserIndex < groupedStories.length - 1) {
      setActiveUserIndex((prev) => prev + 1);
      setActiveStoryIndex(0);
    } else {
      setShowViewer(false);
    }
  };

  const prevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex((prev) => prev - 1);
    } else if (activeUserIndex > 0) {
      setActiveUserIndex((prev) => prev - 1);
      const prevUserStories = groupedStories[activeUserIndex - 1]?.stories || [];
      setActiveStoryIndex(prevUserStories.length - 1);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const currentUserGroup = groupedStories[activeUserIndex];
  const currentStory = currentUserGroup?.stories[activeStoryIndex];
  const isOwnStory = currentStory?.user_id === user?.id;

  // Parse text overlays from story data
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
      {/* Stories Row */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {user && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowCreate(true); }}
            className="flex flex-col items-center gap-2 flex-shrink-0 group"
          >
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-dashed border-primary/50 group-hover:border-primary transition-colors">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-display">
                  {getInitials(profile?.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center neon-border-subtle">
                <Plus className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-display tracking-wide group-hover:text-primary transition-colors">
              ADD STORY
            </span>
          </button>
        )}

        {groupedStories.map((group, index) => (
          <button
            key={group.userId}
            onClick={() => openViewer(index)}
            className="flex flex-col items-center gap-2 flex-shrink-0 group"
          >
            <div className="p-0.5 rounded-full bg-gradient-to-br from-primary to-primary-glow neon-border-subtle">
              <Avatar className="h-16 w-16 border-2 border-background">
                <AvatarImage src={group.profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-card text-foreground font-display">
                  {getInitials(group.profile?.display_name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-16 group-hover:text-foreground transition-colors">
              {group.userId === user?.id ? 'My Story' : (group.profile?.display_name?.split(' ')[0] || 'User')}
            </span>
          </button>
        ))}

        {loading && (
          <div className="flex items-center justify-center w-16 h-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Story Editor (fullscreen) */}
      {showCreate && (
        <StoryEditor
          onPublish={handlePublishStory}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Story Viewer */}
      <AnimatePresence>
        {showViewer && currentStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            {/* Progress bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
              {currentUserGroup.stories.map((story, idx) => (
                <div key={idx} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: idx < activeStoryIndex ? '100%' : '0%' }}
                    animate={{
                      width: idx < activeStoryIndex ? '100%' : idx === activeStoryIndex ? '100%' : '0%'
                    }}
                    transition={{
                      duration: idx === activeStoryIndex && !story.video_url ? 5 : 0,
                      ease: 'linear'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-white/30">
                  <AvatarImage src={currentUserGroup.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-white/10 text-white">
                    {getInitials(currentUserGroup.profile?.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium">
                    {currentUserGroup.profile?.display_name || 'User'}
                  </p>
                  <p className="text-white/60 text-xs">
                    {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isOwnStory && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => handleDeleteStory(currentStory.id)}
                        disabled={deleting}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deleting ? 'Deleting...' : 'Delete Story'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setShowViewer(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Story Content */}
            <div
              className="w-full max-w-md mx-4 aspect-[9/16] rounded-2xl overflow-hidden relative"
              style={{
                backgroundColor: getStoryBgColor(currentStory) || '#1C1C1E',
              }}
            >
              {/* Video background */}
              {currentStory.video_url && (
                <div className="absolute inset-0">
                  <video
                    ref={storyVideoRef}
                    src={currentStory.video_url}
                    className="w-full h-full object-cover"
                    autoPlay loop muted={isMuted} playsInline
                    onEnded={nextStory}
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                    <Button
                      variant="secondary" size="icon"
                      className="bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                      onClick={() => {
                        if (storyVideoRef.current) {
                          if (isPlaying) storyVideoRef.current.pause();
                          else storyVideoRef.current.play();
                          setIsPlaying(!isPlaying);
                        }
                      }}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="secondary" size="icon"
                      className="bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                      onClick={() => {
                        if (storyVideoRef.current) {
                          storyVideoRef.current.muted = !isMuted;
                          setIsMuted(!isMuted);
                        }
                      }}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              {/* Image background */}
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

              {/* Legacy text content (for old stories without overlays) */}
              {currentStory.content && getStoryOverlays(currentStory).length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <p className="text-white text-xl text-center font-display tracking-wide">
                    {currentStory.content}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <button
              onClick={prevStory}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextStory}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
