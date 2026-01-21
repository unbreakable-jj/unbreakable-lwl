-- Create segments table to store detected route segments
CREATE TABLE public.segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_lat NUMERIC NOT NULL,
  start_lng NUMERIC NOT NULL,
  end_lat NUMERIC NOT NULL,
  end_lng NUMERIC NOT NULL,
  distance_m NUMERIC NOT NULL,
  elevation_gain_m NUMERIC DEFAULT 0,
  polyline TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_efforts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create segment_efforts table to track each user's attempts on segments
CREATE TABLE public.segment_efforts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id UUID NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  run_id UUID REFERENCES public.runs(id) ON DELETE CASCADE,
  elapsed_time_seconds INTEGER NOT NULL,
  start_index INTEGER,
  end_index INTEGER,
  is_kom BOOLEAN DEFAULT false,
  is_pr BOOLEAN DEFAULT false,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create local_legend_stats table for 90-day rolling counts
CREATE TABLE public.local_legend_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id UUID NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  effort_count INTEGER DEFAULT 0,
  last_effort_at TIMESTAMP WITH TIME ZONE,
  is_local_legend BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(segment_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segment_efforts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_legend_stats ENABLE ROW LEVEL SECURITY;

-- Segments policies (public read, authenticated create)
CREATE POLICY "Segments are viewable by everyone"
ON public.segments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create segments"
ON public.segments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creators can update their segments"
ON public.segments FOR UPDATE
USING (created_by = auth.uid());

-- Segment efforts policies
CREATE POLICY "Segment efforts are viewable by everyone"
ON public.segment_efforts FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own efforts"
ON public.segment_efforts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own efforts"
ON public.segment_efforts FOR UPDATE
USING (auth.uid() = user_id);

-- Local legend stats policies
CREATE POLICY "Local legend stats are viewable by everyone"
ON public.local_legend_stats FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own stats"
ON public.local_legend_stats FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
ON public.local_legend_stats FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_segment_efforts_segment_id ON public.segment_efforts(segment_id);
CREATE INDEX idx_segment_efforts_user_id ON public.segment_efforts(user_id);
CREATE INDEX idx_segment_efforts_elapsed_time ON public.segment_efforts(segment_id, elapsed_time_seconds);
CREATE INDEX idx_local_legend_segment_user ON public.local_legend_stats(segment_id, user_id);

-- Create trigger for updated_at on segments
CREATE TRIGGER update_segments_updated_at
BEFORE UPDATE ON public.segments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on local_legend_stats
CREATE TRIGGER update_local_legend_stats_updated_at
BEFORE UPDATE ON public.local_legend_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();