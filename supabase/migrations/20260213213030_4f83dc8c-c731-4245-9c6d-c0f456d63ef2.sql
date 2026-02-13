
-- UNBREAKABLE 86 Programme Tables

-- Main programme record
CREATE TABLE public.unbreakable_86_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fitness_level TEXT NOT NULL CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  equipment TEXT[] NOT NULL DEFAULT '{}',
  injuries TEXT,
  training_environment TEXT NOT NULL CHECK (training_environment IN ('gym', 'home', 'outdoor')),
  running_ability TEXT NOT NULL CHECK (running_ability IN ('continuous', 'run_walk', 'walk_only')),
  goal_emphasis TEXT CHECK (goal_emphasis IN ('fat_loss', 'general_fitness', 'mental_discipline', 'strength_maintenance', 'endurance_improvement')),
  current_day INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'active', 'completed', 'restarted', 'abandoned')),
  restart_enabled BOOLEAN NOT NULL DEFAULT false,
  restart_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_generated_week INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily tracking (exercises + habits + journal)
CREATE TABLE public.unbreakable_86_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.unbreakable_86_programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 86),
  -- Run data
  run_distance_km NUMERIC NOT NULL,
  run_completed BOOLEAN NOT NULL DEFAULT false,
  run_time_seconds INTEGER,
  run_notes TEXT,
  -- Strength data
  strength_time_minutes INTEGER NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]',
  strength_completed BOOLEAN NOT NULL DEFAULT false,
  -- Habit tracking
  habit_train BOOLEAN NOT NULL DEFAULT false,
  habit_control_inputs BOOLEAN NOT NULL DEFAULT false,
  habit_learn_daily BOOLEAN NOT NULL DEFAULT false,
  habit_journal BOOLEAN NOT NULL DEFAULT false,
  habit_hard_thing BOOLEAN NOT NULL DEFAULT false,
  habit_identity BOOLEAN NOT NULL DEFAULT false,
  -- Journal entries
  journal_entry TEXT,
  identity_reflection TEXT,
  -- Status
  day_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(program_id, day_number)
);

-- Enable RLS
ALTER TABLE public.unbreakable_86_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unbreakable_86_days ENABLE ROW LEVEL SECURITY;

-- Programs policies
CREATE POLICY "Users can view their own u86 programs"
ON public.unbreakable_86_programs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own u86 programs"
ON public.unbreakable_86_programs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own u86 programs"
ON public.unbreakable_86_programs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own u86 programs"
ON public.unbreakable_86_programs FOR DELETE
USING (auth.uid() = user_id);

-- Days policies
CREATE POLICY "Users can view their own u86 days"
ON public.unbreakable_86_days FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own u86 days"
ON public.unbreakable_86_days FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own u86 days"
ON public.unbreakable_86_days FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own u86 days"
ON public.unbreakable_86_days FOR DELETE
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_u86_programs_user ON public.unbreakable_86_programs(user_id);
CREATE INDEX idx_u86_programs_status ON public.unbreakable_86_programs(status);
CREATE INDEX idx_u86_days_program ON public.unbreakable_86_days(program_id);
CREATE INDEX idx_u86_days_user ON public.unbreakable_86_days(user_id);
CREATE INDEX idx_u86_days_day ON public.unbreakable_86_days(program_id, day_number);

-- Updated_at triggers
CREATE TRIGGER update_u86_programs_updated_at
BEFORE UPDATE ON public.unbreakable_86_programs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_u86_days_updated_at
BEFORE UPDATE ON public.unbreakable_86_days
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
