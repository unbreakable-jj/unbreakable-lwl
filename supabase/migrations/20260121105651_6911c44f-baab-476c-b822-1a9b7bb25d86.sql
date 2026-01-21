-- Create medals table for tracking user achievements
CREATE TABLE public.medals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  run_id UUID REFERENCES public.runs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, code)
);

-- Enable RLS
ALTER TABLE public.medals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Medals are viewable by everyone" 
ON public.medals 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert medals" 
ON public.medals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medals" 
ON public.medals 
FOR DELETE 
USING (auth.uid() = user_id);