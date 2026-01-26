import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExerciseVideos, ExerciseVideo } from '@/hooks/useExerciseVideos';
import { useAIPreferences } from '@/hooks/useAIPreferences';
import { format } from 'date-fns';
import {
  Video,
  Upload,
  Trash2,
  Play,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Camera,
  X,
} from 'lucide-react';

interface VideoRecorderProps {
  sessionId?: string;
  exerciseLogId?: string;
  exerciseName: string;
  onVideoRecorded?: (videoId: string) => void;
}

export function VideoRecorder({
  sessionId,
  exerciseLogId,
  exerciseName,
  onVideoRecorded,
}: VideoRecorderProps) {
  const { uploadVideo, requestAnalysis } = useExerciseVideos(sessionId);
  const { preferences } = useAIPreferences();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadVideo.mutateAsync({
      file,
      exerciseName,
      sessionId,
      exerciseLogId,
    });

    if (preferences?.movement_analysis_enabled) {
      await requestAnalysis.mutateAsync(result.id);
    }

    onVideoRecorded?.(result.id);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUploadRecorded = async () => {
    if (!recordedBlob) return;

    const file = new File([recordedBlob], `${exerciseName}-${Date.now()}.webm`, {
      type: 'video/webm',
    });

    const result = await uploadVideo.mutateAsync({
      file,
      exerciseName,
      sessionId,
      exerciseLogId,
    });

    if (preferences?.movement_analysis_enabled) {
      await requestAnalysis.mutateAsync(result.id);
    }

    setRecordedBlob(null);
    setPreviewUrl(null);
    onVideoRecorded?.(result.id);
  };

  const cancelRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setRecordedBlob(null);
    setPreviewUrl(null);
    setIsRecording(false);
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!isRecording && !previewUrl ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadVideo.isPending}
            className="flex-1 gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Video
          </Button>
          <Button
            variant="outline"
            onClick={startRecording}
            className="flex-1 gap-2"
          >
            <Camera className="w-4 h-4" />
            Record
          </Button>
        </div>
      ) : isRecording ? (
        <div className="space-y-3">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="animate-pulse gap-1">
                <div className="w-2 h-2 rounded-full bg-white" />
                Recording
              </Badge>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={stopRecording}
            className="w-full gap-2"
          >
            <X className="w-4 h-4" />
            Stop Recording
          </Button>
        </div>
      ) : previewUrl ? (
        <div className="space-y-3">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              src={previewUrl}
              controls
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={cancelRecording}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadRecorded}
              disabled={uploadVideo.isPending}
              className="flex-1 gap-2"
            >
              {uploadVideo.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Save
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface VideoGalleryProps {
  sessionId?: string;
}

export function VideoGallery({ sessionId }: VideoGalleryProps) {
  const { videos, isLoading, requestAnalysis, deleteVideo } = useExerciseVideos(sessionId);
  const { preferences } = useAIPreferences();
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-8">
        <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No videos recorded yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="grid grid-cols-2 gap-3">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden border border-border bg-card">
            <div className="relative aspect-video bg-black">
              {playingVideo === video.id ? (
                <video
                  src={video.video_url}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                  onEnded={() => setPlayingVideo(null)}
                />
              ) : (
                <>
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.exercise_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <button
                    onClick={() => setPlayingVideo(video.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                  >
                    <Play className="w-10 h-10 text-white" />
                  </button>
                </>
              )}
            </div>
            
            <div className="p-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground truncate">
                  {video.exercise_name}
                </span>
                {getStatusIcon(video.analysis_status)}
              </div>
              
              <p className="text-[10px] text-muted-foreground">
                {format(new Date(video.created_at), 'MMM d, h:mm a')}
              </p>

              {video.analysis_result && (
                <div className="p-2 rounded bg-surface text-[10px] text-muted-foreground">
                  {typeof video.analysis_result === 'object' && 'feedback' in video.analysis_result
                    ? (video.analysis_result as any).feedback
                    : 'Analysis complete'}
                </div>
              )}

              <div className="flex gap-1">
                {video.analysis_status === 'pending' && preferences?.movement_analysis_enabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => requestAnalysis.mutate(video.id)}
                    disabled={requestAnalysis.isPending}
                    className="flex-1 h-7 text-[10px] gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Analyze
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteVideo.mutate(video.id)}
                  className="h-7 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}