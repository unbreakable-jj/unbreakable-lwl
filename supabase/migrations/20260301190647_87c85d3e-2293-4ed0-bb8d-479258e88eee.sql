-- Coach/Dev SELECT policies for session_planners
CREATE POLICY "Coaches can view athlete session planners"
  ON public.session_planners FOR SELECT
  USING (is_coach_of(auth.uid(), user_id));

CREATE POLICY "Coaches can update athlete session planners"
  ON public.session_planners FOR UPDATE
  USING (is_coach_of(auth.uid(), user_id));

CREATE POLICY "Coaches can create session planners for athletes"
  ON public.session_planners FOR INSERT
  WITH CHECK (is_coach_of(auth.uid(), user_id));

-- Coach/Dev SELECT policies for cardio_session_planners
CREATE POLICY "Coaches can view athlete cardio session planners"
  ON public.cardio_session_planners FOR SELECT
  USING (is_coach_of(auth.uid(), user_id));

CREATE POLICY "Coaches can update athlete cardio session planners"
  ON public.cardio_session_planners FOR UPDATE
  USING (is_coach_of(auth.uid(), user_id));

CREATE POLICY "Coaches can create cardio session planners for athletes"
  ON public.cardio_session_planners FOR INSERT
  WITH CHECK (is_coach_of(auth.uid(), user_id));