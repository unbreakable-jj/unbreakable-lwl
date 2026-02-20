
CREATE TABLE public.daily_habits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  habit_date date NOT NULL DEFAULT CURRENT_DATE,
  train boolean NOT NULL DEFAULT false,
  learn_daily boolean NOT NULL DEFAULT false,
  water boolean NOT NULL DEFAULT false,
  do_the_hard_thing boolean NOT NULL DEFAULT false,
  hit_your_numbers boolean NOT NULL DEFAULT false,
  journal text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, habit_date)
);

ALTER TABLE public.daily_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habits"
ON public.daily_habits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
ON public.daily_habits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
ON public.daily_habits FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
ON public.daily_habits FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_daily_habits_updated_at
BEFORE UPDATE ON public.daily_habits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
