
-- Add INSERT and UPDATE RLS policies for coaches on mindset_programmes
CREATE POLICY "Coaches can create mindset programmes for athletes"
ON public.mindset_programmes
FOR INSERT
TO authenticated
WITH CHECK (is_coach_of(auth.uid(), user_id));

CREATE POLICY "Coaches can update athlete mindset programmes"
ON public.mindset_programmes
FOR UPDATE
TO authenticated
USING (is_coach_of(auth.uid(), user_id));
