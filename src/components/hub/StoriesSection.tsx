import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStories, Story } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Globe, Users, Lock, Image, Video, X, ChevronLeft, ChevronRight, Trash2, MoreVertical, Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { compressVideo, generateVideoThumbnail } from '@/lib/videoUtils';
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
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const storyVideoRef = useRef<HTMLVideoElement>(null);

  // Auto-progress for story viewer (only for image stories)
  useEffect(() => {
    if (!showViewer) return;
    
    const currentStory = groupedStories[activeUserIndex]?.stories[activeStoryIndex];
    if (currentStory?.video_url) return; // Don't auto-progress for videos

    const timer = setTimeout(() => {
      nextStory();
    }, 5000);

    return () => clearTimeout(timer);
  }, [showViewer, activeUserIndex, activeStoryIndex]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setVideoFile(null);
    setVideoPreview(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Allow up to 500MB - compression will reduce to target size
    if (file.size > 500 * 1024 * 1024) {
      toast.error('Video must be under 500MB');
      return;
    }

    // Warn user if video is large and will be compressed
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 20) {
      toast.info(`Video is ${sizeMB.toFixed(0)}MB - will be compressed during upload`);
    }

    setImageFile(null);
    setImagePreview(null);
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const clearMedia = () => {
    setImageFile(null);
    setImagePreview(null);
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleCreate = async () => {
    if (!content.trim() && !imageFile && !videoFile) {
      toast.error('Add some content, image, or video');
      return;
    }

    setUploading(true);
    let imageUrl: string | null = null;
    let videoUrl: string | null = null;

    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const path = `${user!.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(path, imageFile);

      if (uploadError) {
        toast.error('Failed to upload image');
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    if (videoFile) {
      try {
        // Stage 1: Compress video if needed
        setUploadProgress('Compressing video...');
        const compressedFile = await compressVideo(videoFile, 10, 1080);
        
        // Stage 2: Upload video
        setUploadProgress('Uploading video...');
        const ext = compressedFile.name.split('.').pop() || 'webm';
        const path = `stories/${user!.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('post-videos')
          .upload(path, compressedFile);

        if (uploadError) {
          toast.error('Failed to upload video');
          setUploading(false);
          setUploadProgress(null);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('post-videos')
          .getPublicUrl(path);
        videoUrl = urlData.publicUrl;
        setUploadProgress(null);
      } catch (error) {
        console.error('Video processing error:', error);
        toast.error('Failed to process video');
        setUploading(false);
        setUploadProgress(null);
        return;
      }
    }

    const { error } = await createStory({
      content: content.trim() || null,
      image_url: imageUrl,
      video_url: videoUrl,
      visibility,
    });

    setUploading(false);

    if (error) {
      toast.error('Failed to create story');
    } else {
      toast.success('Story added!');
      setContent('');
      clearMedia();
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

  return (
    <>
      {/* Stories Row */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {/* Add Story Button */}
        {user && (
          <button
            onClick={() => setShowCreate(true)}
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

        {/* User Stories */}
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
              {group.profile?.display_name?.split(' ')[0] || 'User'}
            </span>
          </button>
        ))}

        {loading && (
          <div className="flex items-center justify-center w-16 h-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Create Story Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide text-center neon-glow-subtle">
              ADD TO STORY
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground text-sm">
              Share a moment that lasts 24 hours
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="bg-input border-border min-h-24"
              maxLength={280}
            />

            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                  onClick={clearMedia}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {videoPreview && (
              <div className="relative">
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-h-[300px] rounded-lg"
                  style={{ display: 'block' }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                  onClick={clearMedia}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {!imagePreview && !videoPreview && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Photo
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </Button>
              </div>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoSelect}
            />

            <Select value={visibility} onValueChange={(v) => setVisibility(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Public
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Friends Only
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Only Me
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              className="w-full font-display tracking-wide"
              onClick={handleCreate}
              disabled={uploading || (!content.trim() && !imageFile && !videoFile)}
            >
              {uploading && uploadProgress ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-xs">{uploadProgress}</span>
                </>
              ) : uploading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {uploading ? '' : 'SHARE STORY'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
            <div className="absolute top-4 left-4 right-4 flex gap-1">
              {currentUserGroup.stories.map((story, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: idx < activeStoryIndex ? '100%' : '0%' }}
                    animate={{ 
                      width: idx < activeStoryIndex 
                        ? '100%' 
                        : idx === activeStoryIndex 
                          ? '100%' 
                          : '0%' 
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
            <div className="absolute top-8 left-4 right-4 flex items-center justify-between">
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                      >
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
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  onClick={() => setShowViewer(false)}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Story Content */}
            <div className="w-full max-w-md px-4">
              {currentStory.video_url && (
                <div className="relative">
                  <video
                    ref={storyVideoRef}
                    src={currentStory.video_url}
                    className="w-full max-h-[60vh] object-contain rounded-lg"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    onEnded={nextStory}
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                      onClick={() => {
                        if (storyVideoRef.current) {
                          if (isPlaying) {
                            storyVideoRef.current.pause();
                          } else {
                            storyVideoRef.current.play();
                          }
                          setIsPlaying(!isPlaying);
                        }
                      }}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
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
              {currentStory.image_url && !currentStory.video_url && (
                <img
                  src={currentStory.image_url}
                  alt="Story"
                  className="w-full max-h-[60vh] object-contain rounded-lg"
                />
              )}
              {currentStory.content && (
                <p className="text-white text-xl text-center mt-6 font-display tracking-wide">
                  {currentStory.content}
                </p>
              )}
            </div>

            {/* Navigation */}
            <button
              onClick={prevStory}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextStory}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}