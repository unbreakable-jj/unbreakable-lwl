import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStories, Story } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Globe, Users, Lock, Image, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export function StoriesSection() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { groupedStories, createStory, loading, refetch } = useStories();
  const [showCreate, setShowCreate] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [activeUserIndex, setActiveUserIndex] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreate = async () => {
    if (!content.trim() && !imageFile) {
      toast.error('Add some content or an image');
      return;
    }

    setUploading(true);
    let imageUrl: string | null = null;

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

    const { error } = await createStory({
      content: content.trim() || null,
      image_url: imageUrl,
      visibility,
    });

    setUploading(false);

    if (error) {
      toast.error('Failed to create story');
    } else {
      toast.success('Story added!');
      setContent('');
      clearImage();
      setShowCreate(false);
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

  return (
    <>
      {/* Stories Row */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {/* Add Story Button */}
        {user && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-dashed border-primary/50">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-display">
                  {getInitials(profile?.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-display tracking-wide">
              ADD STORY
            </span>
          </button>
        )}

        {/* User Stories */}
        {groupedStories.map((group, index) => (
          <button
            key={group.userId}
            onClick={() => openViewer(index)}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className="p-0.5 rounded-full bg-gradient-to-br from-primary to-primary-glow">
              <Avatar className="h-16 w-16 border-2 border-background">
                <AvatarImage src={group.profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-card text-foreground font-display">
                  {getInitials(group.profile?.display_name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-16">
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
            <DialogTitle className="font-display text-xl tracking-wide text-center">
              ADD TO STORY
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="bg-input border-border min-h-24"
              maxLength={280}
            />

            {imagePreview ? (
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
                  onClick={clearImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="w-4 h-4 mr-2" />
                Add Photo
              </Button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
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
              disabled={uploading || (!content.trim() && !imageFile)}
            >
              {uploading ? 'Posting...' : 'SHARE STORY'}
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
              {currentUserGroup.stories.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                >
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      idx < activeStoryIndex
                        ? 'w-full'
                        : idx === activeStoryIndex
                        ? 'w-full animate-pulse'
                        : 'w-0'
                    }`}
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
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setShowViewer(false)}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Story Content */}
            <div className="w-full max-w-md px-4">
              {currentStory.image_url && (
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