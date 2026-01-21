-- Add date_of_birth to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Create trophies table for age/distance category achievements
CREATE TABLE public.trophies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  run_id UUID,
  category TEXT NOT NULL, -- e.g., 'overall_5k', '40-49_10k', 'overall_any'
  age_group TEXT, -- '18-29', '30-39', '40-49', '50-59', '60+'
  distance_bucket TEXT NOT NULL, -- '5k', '10k', 'half', 'any'
  rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 3),
  pace_per_km_seconds INTEGER NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for efficient lookups
CREATE INDEX idx_trophies_user_id ON public.trophies(user_id);
CREATE INDEX idx_trophies_category ON public.trophies(category);
CREATE INDEX idx_trophies_distance_bucket ON public.trophies(distance_bucket);
CREATE INDEX idx_trophies_age_group ON public.trophies(age_group);

-- Add unique constraint to prevent duplicate trophies for same category
CREATE UNIQUE INDEX idx_trophies_unique_category_user ON public.trophies(user_id, category);

-- Enable RLS
ALTER TABLE public.trophies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trophies
CREATE POLICY "Trophies are viewable by everyone"
  ON public.trophies
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own trophies"
  ON public.trophies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trophies"
  ON public.trophies
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trophies"
  ON public.trophies
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add CHECK constraints
ALTER TABLE public.trophies
  ADD CONSTRAINT check_trophy_category_length
    CHECK (char_length(category) > 0 AND char_length(category) <= 50),
  ADD CONSTRAINT check_trophy_age_group_valid
    CHECK (age_group IS NULL OR age_group IN ('18-29', '30-39', '40-49', '50-59', '60+')),
  ADD CONSTRAINT check_trophy_distance_bucket_valid
    CHECK (distance_bucket IN ('5k', '10k', 'half', 'any')),
  ADD CONSTRAINT check_trophy_pace_positive
    CHECK (pace_per_km_seconds > 0 AND pace_per_km_seconds < 3600);