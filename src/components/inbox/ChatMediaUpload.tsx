import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Video, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export interface ChatMediaAttachment {
  type: 'image' | 'video';
  url: string;
  file: File;
  preview: string;
}

interface ChatMediaUploadProps {
  attachment: ChatMediaAttachment | null;
  onAttachmentChange: (attachment: ChatMediaAttachment | null) => void;
  disabled?: boolean;
}

// Same limits as timeline feed
const MAX_IMAGE_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 500;

export function ChatMediaUpload({
  attachment,
  onAttachmentChange,
  disabled,
}: ChatMediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = '';

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_IMAGE_SIZE_MB) {
      toast.error(`Image must be less than ${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }

    setIsUploading(true);
    setUploadProgress('Uploading image...');

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      onAttachmentChange({
        type: 'image',
        url: urlData.publicUrl,
        file,
        preview: URL.createObjectURL(file),
      });

      toast.success('Image attached');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = '';

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_VIDEO_SIZE_MB) {
      toast.error(`Video must be less than ${MAX_VIDEO_SIZE_MB}MB`);
      return;
    }

    if (sizeMB > 50) {
      toast.info(`Uploading ${sizeMB.toFixed(0)}MB video...`);
    }

    setIsUploading(true);
    setUploadProgress('Uploading video...');

    try {
      const ext = file.name.split('.').pop() || 'mp4';
      const fileName = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('post-videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('post-videos')
        .getPublicUrl(fileName);

      onAttachmentChange({
        type: 'video',
        url: urlData.publicUrl,
        file,
        preview: URL.createObjectURL(file),
      });

      toast.success('Video attached');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const removeAttachment = () => {
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    onAttachmentChange(null);
  };

  return (
    <div className="space-y-2">
      {/* Hidden file inputs */}
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

      {/* Attachment preview */}
      <AnimatePresence>
        {attachment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative rounded-lg overflow-hidden bg-muted/50"
          >
            {attachment.type === 'image' ? (
              <img
                src={attachment.preview}
                alt="Attachment"
                className="max-h-48 w-auto rounded-lg object-contain mx-auto"
              />
            ) : (
              <video
                src={attachment.preview}
                controls
                className="max-h-48 w-full rounded-lg"
              />
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-7 w-7 p-0"
              onClick={removeAttachment}
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload buttons */}
      {!attachment && (
        <div className="flex items-center gap-1">
          {isUploading ? (
            <div className="flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs">{uploadProgress}</span>
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => imageInputRef.current?.click()}
                disabled={disabled}
              >
                <Image className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => videoInputRef.current?.click()}
                disabled={disabled}
              >
                <Video className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
