CREATE POLICY "Users can delete their own records"
ON public.personal_records FOR DELETE
USING (auth.uid() = user_id);