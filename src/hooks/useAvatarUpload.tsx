import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useAvatarUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (file: File): Promise<{ url: string | null; error: Error | null }> => {
    if (!user) {
      return { url: null, error: new Error('Not authenticated') };
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      return { url: null, error: new Error('File must be an image') };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: new Error('Image must be less than 5MB') };
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      return { url: urlData.publicUrl, error: null };
    } catch (err) {
      console.error('Avatar upload error:', err);
      return { url: null, error: err as Error };
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async (): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    try {
      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      return { error: null };
    } catch (err) {
      console.error('Avatar remove error:', err);
      return { error: err as Error };
    }
  };

  return { uploadAvatar, removeAvatar, uploading };
}
