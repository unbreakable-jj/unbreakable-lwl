
-- Create snake_scores table for leaderboard
CREATE TABLE public.snake_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  score integer NOT NULL DEFAULT 0,
  theme_shifts integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.snake_scores ENABLE ROW LEVEL SECURITY;

-- Everyone can view scores (public leaderboard)
CREATE POLICY "Snake scores are viewable by everyone"
ON public.snake_scores
FOR SELECT
USING (true);

-- Users can insert their own scores
CREATE POLICY "Users can insert their own snake scores"
ON public.snake_scores
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own scores
CREATE POLICY "Users can delete their own snake scores"
ON public.snake_scores
FOR DELETE
USING (auth.uid() = user_id);

-- Index for leaderboard queries
CREATE INDEX idx_snake_scores_score ON public.snake_scores (score DESC);
CREATE INDEX idx_snake_scores_user ON public.snake_scores (user_id);
