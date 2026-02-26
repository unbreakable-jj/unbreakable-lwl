
CREATE TABLE public.mindset_programmes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  daily_minutes INTEGER NOT NULL DEFAULT 15,
  focus_areas TEXT[],
  status TEXT NOT NULL DEFAULT 'not_started',
  programme_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mindset_programmes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mindset programmes"
  ON public.mindset_programmes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own mindset programmes"
  ON public.mindset_programmes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mindset programmes"
  ON public.mindset_programmes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mindset programmes"
  ON public.mindset_programmes FOR DELETE
  USING (auth.uid() = user_id);
