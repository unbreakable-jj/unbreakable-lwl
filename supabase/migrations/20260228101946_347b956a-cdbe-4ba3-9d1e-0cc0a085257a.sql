
CREATE TABLE public.cardio_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  overview TEXT,
  program_data JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE,
  current_week INTEGER DEFAULT 1,
  current_day INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cardio_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cardio programs" ON public.cardio_programs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own cardio programs" ON public.cardio_programs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cardio programs" ON public.cardio_programs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cardio programs" ON public.cardio_programs FOR DELETE USING (auth.uid() = user_id);
