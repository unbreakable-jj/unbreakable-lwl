
-- Create tetris scores table
CREATE TABLE public.tetris_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  lines_cleared INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tetris_scores ENABLE ROW LEVEL SECURITY;

-- Everyone can view scores (leaderboard)
CREATE POLICY "Anyone can view tetris scores"
ON public.tetris_scores FOR SELECT
USING (true);

-- Authenticated users can insert their own scores
CREATE POLICY "Users can insert own tetris scores"
ON public.tetris_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);
