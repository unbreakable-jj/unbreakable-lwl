-- Add message read receipts support
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS read_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'));

-- Create live streams table for Go Live feature
CREATE TABLE IF NOT EXISTS public.live_streams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Live Stream',
  description text,
  status text NOT NULL DEFAULT 'starting' CHECK (status IN ('starting', 'live', 'ended', 'cancelled')),
  viewer_count integer DEFAULT 0,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  stream_key text NOT NULL DEFAULT gen_random_uuid()::text,
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  allow_comments boolean DEFAULT true,
  thumbnail_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on live_streams
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

-- RLS policies for live_streams
CREATE POLICY "Live streams are viewable based on visibility"
ON public.live_streams FOR SELECT
USING (
  auth.uid() = user_id 
  OR visibility = 'public' 
  OR (visibility = 'friends' AND are_friends(auth.uid(), user_id))
);

CREATE POLICY "Users can create their own streams"
ON public.live_streams FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streams"
ON public.live_streams FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own streams"
ON public.live_streams FOR DELETE
USING (auth.uid() = user_id);

-- Add live streaming settings to user_settings
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS live_notifications_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS default_stream_visibility text DEFAULT 'friends' CHECK (default_stream_visibility IN ('public', 'friends', 'private')),
ADD COLUMN IF NOT EXISTS stream_quality text DEFAULT 'auto' CHECK (stream_quality IN ('auto', '1080p', '720p', '480p'));

-- Trigger for updating timestamps
CREATE TRIGGER update_live_streams_updated_at
BEFORE UPDATE ON public.live_streams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live streams
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams;