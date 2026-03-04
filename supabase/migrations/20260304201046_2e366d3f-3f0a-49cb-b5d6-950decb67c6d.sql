
-- Create feedback_responses table
CREATE TABLE public.feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES public.coaching_feedback(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  response_type TEXT NOT NULL DEFAULT 'reply',
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;

-- Athletes can insert responses on feedback addressed to them
CREATE POLICY "Athletes can respond to their feedback"
ON public.feedback_responses FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.coaching_feedback
    WHERE id = feedback_id AND athlete_id = auth.uid()
  )
);

-- Athletes can view their own responses
CREATE POLICY "Athletes can view their responses"
ON public.feedback_responses FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Coaches can view responses on feedback they created
CREATE POLICY "Coaches can view responses on their feedback"
ON public.feedback_responses FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coaching_feedback
    WHERE id = feedback_id AND coach_id = auth.uid()
  )
);

-- Athletes can delete their own responses
CREATE POLICY "Athletes can delete their responses"
ON public.feedback_responses FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Devs can manage all
CREATE POLICY "Devs can manage all feedback responses"
ON public.feedback_responses FOR ALL TO authenticated
USING (has_role(auth.uid(), 'dev'))
WITH CHECK (has_role(auth.uid(), 'dev'));

-- Notification trigger when athlete responds
CREATE OR REPLACE FUNCTION public.notify_coach_on_feedback_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  fb_record RECORD;
BEGIN
  SELECT coach_id, title INTO fb_record
  FROM public.coaching_feedback
  WHERE id = NEW.feedback_id;

  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    fb_record.coach_id,
    'feedback_response',
    'Athlete Responded',
    CASE
      WHEN NEW.response_type = 'acknowledged' THEN 'Your athlete acknowledged feedback: ' || fb_record.title
      ELSE 'Your athlete replied to feedback: ' || fb_record.title
    END,
    jsonb_build_object(
      'feedback_id', NEW.feedback_id,
      'response_id', NEW.id,
      'response_type', NEW.response_type
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_feedback_response_notify
  AFTER INSERT ON public.feedback_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_coach_on_feedback_response();
