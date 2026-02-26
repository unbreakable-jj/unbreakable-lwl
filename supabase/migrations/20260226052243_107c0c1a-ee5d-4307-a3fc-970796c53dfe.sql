ALTER TABLE public.nutrition_goals 
ADD COLUMN IF NOT EXISTS goals_mode TEXT NOT NULL DEFAULT 'auto',
ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS macro_split TEXT DEFAULT 'high_protein';