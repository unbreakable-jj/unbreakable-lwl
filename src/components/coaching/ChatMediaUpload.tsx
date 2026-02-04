import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Video, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ChatMedia {
  type: 'image' | 'video';
  url: string;
  name: string;
}

interface ChatMediaUploadProps {
  onMediaSelect: (media: ChatMedia) => void;
  selectedMedia: ChatMedia | null;
  onClearMedia: () => void;
  disabled?: boolean;
}

export function ChatMediaUpload({ 
  onMediaSelect, 
  selectedMedia, 
  onClearMedia,
  disabled 
}: ChatMediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = async (file: File, type: 'image' | 'video') => {
    if (!user) {
      toast.error('Please sign in to upload media');
      return;
    }

    // Validate file size (500MB max for videos, 5MB for images - matches timeline)
    const maxSize = type === 'video' ? 500 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Max ${type === 'video' ? '500MB' : '5MB'}`);
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (type === 'video' && sizeMB > 50) {
      toast.info(`Uploading ${sizeMB.toFixed(0)}MB video...`);
    }

    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const bucket = type === 'video' ? 'exercise-videos' : 'post-images';

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onMediaSelect({
        type,
        url: urlData.publicUrl,
        name: file.name,
      });

      toast.success(`${type === 'video' ? 'Video' : 'Image'} attached`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload media');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file, 'image');
          e.target.value = '';
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file, 'video');
          e.target.value = '';
        }}
      />

      {/* Upload buttons */}
      {!selectedMedia && !isUploading && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled}
          >
            <Image className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => videoInputRef.current?.click()}
            disabled={disabled}
          >
            <Video className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </Button>
        </>
      )}

      {/* Loading state */}
      {isUploading && (
        <div className="flex items-center gap-2 px-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Uploading...</span>
        </div>
      )}

      {/* Selected media preview */}
      {selectedMedia && !isUploading && (
        <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-lg">
          {selectedMedia.type === 'image' ? (
            <Image className="w-4 h-4 text-primary" />
          ) : (
            <Video className="w-4 h-4 text-primary" />
          )}
          <span className="text-xs text-foreground max-w-24 truncate">
            {selectedMedia.name}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClearMedia}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
