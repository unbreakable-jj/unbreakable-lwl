import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Video, X, Loader2, Globe, Users, Lock, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { usePosts } from '@/hooks/usePosts';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function CreatePostBox() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { createPost, uploadImage, uploadVideo } = usePosts();
  
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      // Clear video if selecting image
      setVideoFile(null);
      setVideoPreview(null);
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setIsExpanded(true);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video must be less than 50MB');
        return;
      }
      // Clear image if selecting video
      setImageFile(null);
      setImagePreview(null);
      
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      setIsExpanded(true);
    }
  };

  const removeMedia = () => {
    setImageFile(null);
    setImagePreview(null);
    setVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile && !videoFile) {
      toast.error('Please add some content, image, or video');
      return;
    }

    setIsSubmitting(true);

    let imageUrl: string | null = null;
    let videoUrl: string | null = null;

    if (imageFile) {
      const { url, error: uploadError } = await uploadImage(imageFile);
      if (uploadError) {
        toast.error('Failed to upload image');
        setIsSubmitting(false);
        return;
      }
      imageUrl = url;
    }

    if (videoFile) {
      const { url, thumbnailUrl, error: uploadError } = await uploadVideo(
        videoFile,
        (stage) => setUploadProgress(stage)
      );
      if (uploadError) {
        toast.error('Failed to upload video');
        setIsSubmitting(false);
        setUploadProgress(null);
        return;
      }
      videoUrl = url;
      // If we got a thumbnail, we could use it but for now video_url handles display
      if (thumbnailUrl) {
        console.log('Video thumbnail generated:', thumbnailUrl);
      }
    }
    setUploadProgress(null);

    const { error } = await createPost({
      content: content.trim() || undefined,
      image_url: imageUrl || undefined,
      video_url: videoUrl || undefined,
      visibility,
    });

    if (error) {
      toast.error('Failed to create post');
    } else {
      toast.success('Post shared!');
      setContent('');
      removeMedia();
      setIsExpanded(false);
    }

    setIsSubmitting(false);
  };

  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'friends':
        return <Users className="w-4 h-4" />;
      case 'private':
        return <Lock className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-card border-border p-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground font-display">
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          {/* Input Area */}
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (e.target.value) setIsExpanded(true);
            }}
            onFocus={() => setIsExpanded(true)}
            className={`bg-muted/50 border-0 resize-none transition-all ${
              isExpanded ? 'min-h-[100px]' : 'min-h-[44px]'
            }`}
          />

          {/* Image Preview */}
          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-64 rounded-lg object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={removeMedia}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Preview */}
          <AnimatePresence>
            {videoPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <video
                  src={videoPreview}
                  controls
                  className="max-h-64 rounded-lg w-full"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={removeMedia}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between gap-2 pt-2 border-t border-border"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    ref={imageInputRef}
                    className="hidden"
                  />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    ref={videoInputRef}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                    className="text-muted-foreground"
                    disabled={!!videoFile}
                  >
                    <Image className="w-5 h-5 mr-1" />
                    Photo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => videoInputRef.current?.click()}
                    className="text-muted-foreground"
                    disabled={!!imageFile}
                  >
                    <Video className="w-5 h-5 mr-1" />
                    Video
                  </Button>

                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger className="w-auto h-8 border-0 bg-transparent">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {getVisibilityIcon()}
                        <SelectValue />
                      </div>
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
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (!content.trim() && !imageFile && !videoFile)}
                  className="font-display tracking-wide"
                >
                  {isSubmitting && uploadProgress ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-xs">{uploadProgress}</span>
                    </>
                  ) : isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Post
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}