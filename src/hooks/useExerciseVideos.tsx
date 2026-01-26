import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ExerciseVideo {
  id: string;
  user_id: string;
  session_id: string | null;
  exercise_log_id: string | null;
  exercise_name: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  analysis_result: any;
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export function useExerciseVideos(sessionId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videos, isLoading } = useQuery({
    queryKey: ['exercise-videos', user?.id, sessionId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('exercise_videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ExerciseVideo[];
    },
    enabled: !!user,
  });

  const uploadVideo = useMutation({
    mutationFn: async ({ 
      file, 
      exerciseName,
      sessionId,
      exerciseLogId,
    }: { 
      file: File; 
      exerciseName: string;
      sessionId?: string;
      exerciseLogId?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('exercise-videos')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('exercise-videos')
        .getPublicUrl(fileName);
      
      // Create database record
      const { data, error } = await supabase
        .from('exercise_videos')
        .insert({
          user_id: user.id,
          session_id: sessionId || null,
          exercise_log_id: exerciseLogId || null,
          exercise_name: exerciseName,
          video_url: urlData.publicUrl,
          analysis_status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-videos'] });
      toast({ title: 'Video Uploaded', description: 'Your exercise video has been saved.' });
    },
    onError: (error) => {
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
    },
  });

  const requestAnalysis = useMutation({
    mutationFn: async (videoId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      // Update status to processing
      await supabase
        .from('exercise_videos')
        .update({ analysis_status: 'processing' })
        .eq('id', videoId);
      
      // Call edge function for AI analysis
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-movement`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ videoId }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-videos'] });
      toast({ title: 'Analysis Complete', description: 'Check your movement feedback!' });
    },
    onError: (error) => {
      toast({ title: 'Analysis Failed', description: error.message, variant: 'destructive' });
    },
  });

  const deleteVideo = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from('exercise_videos')
        .delete()
        .eq('id', videoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-videos'] });
    },
  });

  return {
    videos,
    isLoading,
    uploadVideo,
    requestAnalysis,
    deleteVideo,
  };
}