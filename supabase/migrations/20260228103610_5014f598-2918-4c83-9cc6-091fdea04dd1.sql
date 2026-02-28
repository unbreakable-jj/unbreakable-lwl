
-- Create cardio session planners table (mirrors session_planners but for cardio_programs)
CREATE TABLE public.cardio_session_planners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_id UUID REFERENCES public.cardio_programs(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  scheduled_date DATE,
  session_type TEXT NOT NULL,
  planned_session JSONB NOT NULL DEFAULT '{}',
  warmup TEXT,
  cooldown TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  duration_minutes INTEGER,
  distance_km NUMERIC,
  actual_duration_minutes INTEGER,
  actual_distance_km NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cardio_session_planners ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own cardio planners" ON public.cardio_session_planners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own cardio planners" ON public.cardio_session_planners FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cardio planners" ON public.cardio_session_planners FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cardio planners" ON public.cardio_session_planners FOR DELETE USING (auth.uid() = user_id);
