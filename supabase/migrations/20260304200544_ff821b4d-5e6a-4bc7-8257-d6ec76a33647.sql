ALTER TABLE public.coaching_profiles ADD COLUMN IF NOT EXISTS mental_health text DEFAULT NULL;

-- Add coach UPDATE policy so coaches can edit athlete bio
CREATE POLICY "Coaches can update athlete coaching profile"
ON public.coaching_profiles
FOR UPDATE
TO authenticated
USING (is_coach_of(auth.uid(), user_id))
WITH CHECK (is_coach_of(auth.uid(), user_id));
