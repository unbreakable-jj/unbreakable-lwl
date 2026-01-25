-- Add AI feedback enabled column to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS ai_feedback_enabled boolean DEFAULT true;