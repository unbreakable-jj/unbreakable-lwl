
-- Create alleyway_scores table (mirrors snake_scores)
CREATE TABLE public.alleyway_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  theme_shifts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alleyway_scores ENABLE ROW LEVEL SECURITY;

-- Scores viewable by everyone (leaderboard)
CREATE POLICY "Alleyway scores are viewable by everyone"
ON public.alleyway_scores
FOR SELECT
USING (true);

-- Users can insert their own scores
CREATE POLICY "Users can insert their own alleyway scores"
ON public.alleyway_scores
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own scores
CREATE POLICY "Users can delete their own alleyway scores"
ON public.alleyway_scores
FOR DELETE
USING (auth.uid() = user_id);
