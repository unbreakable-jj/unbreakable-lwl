-- Allow athletes to delete feedback addressed to them
CREATE POLICY "Athletes can delete their own feedback"
ON public.coaching_feedback
FOR DELETE
TO authenticated
USING (auth.uid() = athlete_id);

-- Allow coaches to delete feedback they created
CREATE POLICY "Coaches can delete their own feedback"
ON public.coaching_feedback
FOR DELETE
TO authenticated
USING (auth.uid() = coach_id);