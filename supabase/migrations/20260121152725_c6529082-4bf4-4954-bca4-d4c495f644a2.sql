-- Training Programs table to save generated programs
CREATE TABLE public.training_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  overview TEXT,
  program_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE,
  current_week INTEGER DEFAULT 1,
  current_day INTEGER DEFAULT 1
);

-- Workout Sessions table to track individual workout sessions
CREATE TABLE public.workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_id UUID REFERENCES public.training_programs(id) ON DELETE SET NULL,
  week_number INTEGER NOT NULL,
  day_name TEXT NOT NULL,
  session_type TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'in_progress',
  notes TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  comments_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exercise Logs table to track sets/reps/weight for each exercise
CREATE TABLE public.exercise_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  equipment TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  target_reps TEXT,
  actual_reps INTEGER,
  weight_kg NUMERIC,
  rpe NUMERIC,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workout Kudos
CREATE TABLE public.workout_kudos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workout_id, user_id)
);

-- Workout Comments
CREATE TABLE public.workout_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_kudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_comments ENABLE ROW LEVEL SECURITY;

-- Training Programs RLS
CREATE POLICY "Users can view their own programs" ON public.training_programs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own programs" ON public.training_programs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own programs" ON public.training_programs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own programs" ON public.training_programs
  FOR DELETE USING (auth.uid() = user_id);

-- Workout Sessions RLS (viewable based on visibility)
CREATE POLICY "Workout sessions are viewable based on visibility" ON public.workout_sessions
  FOR SELECT USING (
    auth.uid() = user_id 
    OR visibility = 'public' 
    OR (visibility = 'friends' AND are_friends(auth.uid(), user_id))
  );

CREATE POLICY "Users can create their own sessions" ON public.workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.workout_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.workout_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Exercise Logs RLS
CREATE POLICY "Exercise logs are viewable with session" ON public.exercise_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws 
      WHERE ws.id = session_id 
      AND (
        ws.user_id = auth.uid() 
        OR ws.visibility = 'public' 
        OR (ws.visibility = 'friends' AND are_friends(auth.uid(), ws.user_id))
      )
    )
  );

CREATE POLICY "Users can create their own exercise logs" ON public.exercise_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise logs" ON public.exercise_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise logs" ON public.exercise_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Workout Kudos RLS
CREATE POLICY "Workout kudos are viewable by everyone" ON public.workout_kudos
  FOR SELECT USING (true);

CREATE POLICY "Users can give kudos to workouts" ON public.workout_kudos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their kudos" ON public.workout_kudos
  FOR DELETE USING (auth.uid() = user_id);

-- Workout Comments RLS
CREATE POLICY "Workout comments are viewable by everyone" ON public.workout_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create workout comments" ON public.workout_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout comments" ON public.workout_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout comments" ON public.workout_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_training_programs_updated_at
  BEFORE UPDATE ON public.training_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at
  BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_comments_updated_at
  BEFORE UPDATE ON public.workout_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();