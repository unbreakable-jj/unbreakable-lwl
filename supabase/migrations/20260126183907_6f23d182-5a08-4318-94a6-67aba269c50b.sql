-- Programme Templates table for reusable programme structures
CREATE TABLE public.programme_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  level TEXT,
  duration_weeks INTEGER DEFAULT 12,
  days_per_week INTEGER DEFAULT 4,
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Session Planners table for auto-filled workout schedules
CREATE TABLE public.session_planners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  scheduled_date DATE,
  session_type TEXT NOT NULL,
  planned_exercises JSONB NOT NULL,
  warmup TEXT,
  cooldown TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workout Feedback table for AI-generated session feedback
CREATE TABLE public.workout_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('session', 'technique', 'progression', 'recovery')),
  content TEXT NOT NULL,
  suggestions JSONB,
  fatigue_score INTEGER CHECK (fatigue_score >= 1 AND fatigue_score <= 10),
  performance_rating TEXT CHECK (performance_rating IN ('excellent', 'good', 'average', 'below_average', 'poor')),
  voice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exercise Videos table for movement recordings
CREATE TABLE public.exercise_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
  exercise_log_id UUID REFERENCES public.exercise_logs(id) ON DELETE SET NULL,
  exercise_name TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  analysis_result JSONB,
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Progression History table for tracking load/rep adjustments
CREATE TABLE public.progression_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  previous_weight_kg NUMERIC,
  new_weight_kg NUMERIC,
  previous_reps INTEGER,
  new_reps INTEGER,
  adjustment_reason TEXT,
  adjustment_type TEXT CHECK (adjustment_type IN ('increase', 'decrease', 'maintain', 'deload')),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User AI Preferences table for voice and analysis settings
CREATE TABLE public.user_ai_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  voice_feedback_enabled BOOLEAN DEFAULT false,
  voice_gender TEXT DEFAULT 'female' CHECK (voice_gender IN ('male', 'female')),
  movement_analysis_enabled BOOLEAN DEFAULT false,
  auto_progression_enabled BOOLEAN DEFAULT true,
  feedback_frequency TEXT DEFAULT 'after_session' CHECK (feedback_frequency IN ('realtime', 'after_set', 'after_session', 'daily')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.programme_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_planners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progression_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for programme_templates
CREATE POLICY "Users can view their own templates" ON public.programme_templates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public templates" ON public.programme_templates
  FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create their own templates" ON public.programme_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.programme_templates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.programme_templates
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for session_planners
CREATE POLICY "Users can view their own planners" ON public.session_planners
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own planners" ON public.session_planners
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own planners" ON public.session_planners
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own planners" ON public.session_planners
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workout_feedback
CREATE POLICY "Users can view their own feedback" ON public.workout_feedback
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own feedback" ON public.workout_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own feedback" ON public.workout_feedback
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for exercise_videos
CREATE POLICY "Users can view their own videos" ON public.exercise_videos
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload their own videos" ON public.exercise_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own videos" ON public.exercise_videos
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own videos" ON public.exercise_videos
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for progression_history
CREATE POLICY "Users can view their own progression" ON public.progression_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own progression" ON public.progression_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_ai_preferences
CREATE POLICY "Users can view their own AI preferences" ON public.user_ai_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own AI preferences" ON public.user_ai_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own AI preferences" ON public.user_ai_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_programme_templates_updated_at
  BEFORE UPDATE ON public.programme_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_session_planners_updated_at
  BEFORE UPDATE ON public.session_planners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_ai_preferences_updated_at
  BEFORE UPDATE ON public.user_ai_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for exercise videos
INSERT INTO storage.buckets (id, name, public) VALUES ('exercise-videos', 'exercise-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for exercise videos
CREATE POLICY "Users can upload exercise videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'exercise-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Exercise videos are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'exercise-videos');

CREATE POLICY "Users can delete their own exercise videos" ON storage.objects
  FOR DELETE USING (bucket_id = 'exercise-videos' AND auth.uid()::text = (storage.foldername(name))[1]);