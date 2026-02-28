
-- 1. Create coaching_feedback table
CREATE TABLE public.coaching_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  athlete_id UUID NOT NULL,
  feedback_type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  performance_rating INTEGER,
  technique_notes TEXT,
  next_session_goals TEXT,
  general_comments TEXT,
  related_session_id UUID,
  related_program_id UUID,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.coaching_feedback ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Coaches can insert feedback for assigned athletes"
ON public.coaching_feedback FOR INSERT
WITH CHECK (
  coach_id = auth.uid()
  AND (is_coach_of(auth.uid(), athlete_id) OR has_role(auth.uid(), 'dev'))
);

CREATE POLICY "Coaches can view their own feedback"
ON public.coaching_feedback FOR SELECT
USING (coach_id = auth.uid());

CREATE POLICY "Athletes can view feedback addressed to them"
ON public.coaching_feedback FOR SELECT
USING (athlete_id = auth.uid());

CREATE POLICY "Coaches can update their own feedback"
ON public.coaching_feedback FOR UPDATE
USING (coach_id = auth.uid());

CREATE POLICY "Devs can manage all feedback"
ON public.coaching_feedback FOR ALL
USING (has_role(auth.uid(), 'dev'))
WITH CHECK (has_role(auth.uid(), 'dev'));

-- 4. Updated_at trigger
CREATE TRIGGER update_coaching_feedback_updated_at
  BEFORE UPDATE ON public.coaching_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Auto-notification trigger
CREATE OR REPLACE FUNCTION public.notify_athlete_on_coaching_feedback()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    NEW.athlete_id,
    'coaching_feedback',
    'Coach Update',
    'Your coach has left new feedback: ' || NEW.title,
    jsonb_build_object(
      'feedback_id', NEW.id,
      'coach_id', NEW.coach_id,
      'type', NEW.feedback_type
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_coaching_feedback_insert
  AFTER INSERT ON public.coaching_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_athlete_on_coaching_feedback();

-- 6. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.coaching_feedback;

-- 7. UPDATE policies for coaches on athlete programmes
CREATE POLICY "Coaches can update athlete programs"
ON public.training_programs FOR UPDATE
USING (is_coach_of(auth.uid(), user_id));

CREATE POLICY "Coaches can update athlete cardio"
ON public.cardio_programs FOR UPDATE
USING (is_coach_of(auth.uid(), user_id));

CREATE POLICY "Coaches can update athlete meal plans"
ON public.meal_plans FOR UPDATE
USING (is_coach_of(auth.uid(), user_id));

CREATE POLICY "Coaches can update athlete meal plan items"
ON public.meal_plan_items FOR UPDATE
USING (is_coach_of(auth.uid(), user_id));
