
-- 1. Update can_message_user to allow coach-athlete messaging bypass
CREATE OR REPLACE FUNCTION public.can_message_user(sender_id uuid, recipient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN sender_id = recipient_id THEN true
    WHEN is_coach_of(sender_id, recipient_id) THEN true
    WHEN is_coach_of(recipient_id, sender_id) THEN true
    WHEN (SELECT allow_messages FROM public.user_settings WHERE user_id = recipient_id) = 'everyone' THEN true
    WHEN (SELECT allow_messages FROM public.user_settings WHERE user_id = recipient_id) = 'friends'
      AND are_friends(sender_id, recipient_id) THEN true
    WHEN (SELECT allow_messages FROM public.user_settings WHERE user_id = recipient_id) = 'none' THEN false
    ELSE are_friends(sender_id, recipient_id)
  END;
$$;

-- 2. Coaches can create training programs for their athletes
CREATE POLICY "Coaches can create programs for athletes"
ON public.training_programs FOR INSERT
WITH CHECK (is_coach_of(auth.uid(), user_id));

-- 3. Coaches can create cardio programs for their athletes
CREATE POLICY "Coaches can create cardio for athletes"
ON public.cardio_programs FOR INSERT
WITH CHECK (is_coach_of(auth.uid(), user_id));

-- 4. Coaches can create meal plans for their athletes
CREATE POLICY "Coaches can create meal plans for athletes"
ON public.meal_plans FOR INSERT
WITH CHECK (is_coach_of(auth.uid(), user_id));

-- 5. Coaches can create meal plan items for their athletes
CREATE POLICY "Coaches can create meal plan items for athletes"
ON public.meal_plan_items FOR INSERT
WITH CHECK (is_coach_of(auth.uid(), user_id));
