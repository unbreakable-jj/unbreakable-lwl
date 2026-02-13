
-- Add social handle columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS social_instagram text,
ADD COLUMN IF NOT EXISTS social_tiktok text,
ADD COLUMN IF NOT EXISTS social_facebook text,
ADD COLUMN IF NOT EXISTS social_twitter text;
