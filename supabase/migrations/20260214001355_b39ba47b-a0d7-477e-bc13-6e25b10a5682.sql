
CREATE TABLE public.space_invaders_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  theme_shifts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.space_invaders_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view space invaders scores"
  ON public.space_invaders_scores FOR SELECT USING (true);

CREATE POLICY "Users can insert their own space invaders scores"
  ON public.space_invaders_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own space invaders scores"
  ON public.space_invaders_scores FOR DELETE
  USING (auth.uid() = user_id);
