-- Create milestones table for auto-generated achievements
CREATE TABLE public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_type TEXT NOT NULL, -- 'streak', 'programme_complete', 'distance_total', 'workout_count', 'trophy', 'level_up'
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- lucide icon name
  value INTEGER, -- numeric value (e.g., streak days, km total)
  is_shared BOOLEAN DEFAULT FALSE, -- user chose to share to feed
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_settings table for preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  -- Privacy settings
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  show_stats_publicly BOOLEAN DEFAULT TRUE,
  allow_comments_default BOOLEAN DEFAULT TRUE,
  allow_friend_requests BOOLEAN DEFAULT TRUE,
  -- Notification preferences
  notify_likes BOOLEAN DEFAULT TRUE,
  notify_comments BOOLEAN DEFAULT TRUE,
  notify_friend_requests BOOLEAN DEFAULT TRUE,
  notify_achievements BOOLEAN DEFAULT TRUE,
  -- Feed preferences
  show_community_posts BOOLEAN DEFAULT TRUE,
  show_achievements_in_feed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for milestones
CREATE POLICY "Users can view their own milestones"
  ON public.milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared public milestones"
  ON public.milestones FOR SELECT
  USING (is_shared = true AND visibility = 'public');

CREATE POLICY "Users can view friend milestones"
  ON public.milestones FOR SELECT
  USING (
    is_shared = true 
    AND visibility = 'friends' 
    AND public.are_friends(auth.uid(), user_id)
  );

CREATE POLICY "Users can insert their own milestones"
  ON public.milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones"
  ON public.milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones"
  ON public.milestones FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for auto-creating settings on user signup
CREATE OR REPLACE FUNCTION public.create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach to profiles table (created when user signs up)
CREATE TRIGGER on_profile_created_create_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_settings();

-- Update timestamp trigger for user_settings
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();