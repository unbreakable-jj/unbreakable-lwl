
-- Coach can read assigned athlete's workout_sessions
CREATE POLICY "Coaches can view athlete sessions"
ON public.workout_sessions FOR SELECT
USING (is_coach_of(auth.uid(), user_id));

-- Coach can read assigned athlete's exercise_logs
CREATE POLICY "Coaches can view athlete exercise logs"
ON public.exercise_logs FOR SELECT
USING (is_coach_of(auth.uid(), user_id));

-- Coach can read assigned athlete's daily_habits
CREATE POLICY "Coaches can view athlete habits"
ON public.daily_habits FOR SELECT
USING (is_coach_of(auth.uid(), user_id));

-- Coach can read assigned athlete's training_programs
CREATE POLICY "Coaches can view athlete programs"
ON public.training_programs FOR SELECT
USING (is_coach_of(auth.uid(), user_id));

-- Coach can read assigned athlete's food_logs
CREATE POLICY "Coaches can view athlete food logs"
ON public.food_logs FOR SELECT
USING (is_coach_of(auth.uid(), user_id));

-- Coach can read assigned athlete's meal_plans
CREATE POLICY "Coaches can view athlete meal plans"
ON public.meal_plans FOR SELECT
USING (is_coach_of(auth.uid(), user_id));

-- Coach can read assigned athlete's meal_plan_items
CREATE POLICY "Coaches can view athlete meal plan items"
ON public.meal_plan_items FOR SELECT
USING (is_coach_of(auth.uid(), user_id));

-- Coach can read assigned athlete's coaching_profiles
CREATE POLICY "Coaches can view athlete coaching profile"
ON public.coaching_profiles FOR SELECT
USING (is_coach_of(auth.uid(), user_id));

-- Coach can read assigned athlete's progression_history
CREATE POLICY "Coaches can view athlete progression"
ON public.progression_history FOR SELECT
USING (is_coach_of(auth.uid(), user_id));

-- Coach can read assigned athlete's personal_records
CREATE POLICY "Coaches can view athlete records"
ON public.personal_records FOR SELECT
USING (is_coach_of(auth.uid(), user_id));

-- Coach can read assigned athlete's exercise_videos
CREATE POLICY "Coaches can view athlete videos"
ON public.exercise_videos FOR SELECT
USING (is_coach_of(auth.uid(), user_id));

-- Coach can read assigned athlete's profile
CREATE POLICY "Coaches can view athlete profile"
ON public.profiles FOR SELECT
USING (is_coach_of(auth.uid(), user_id));

-- Coach can read assigned athlete's cardio_programs
CREATE POLICY "Coaches can view athlete cardio"
ON public.cardio_programs FOR SELECT
USING (is_coach_of(auth.uid(), user_id));

-- Coach can read assigned athlete's runs
CREATE POLICY "Coaches can view athlete runs"
ON public.runs FOR SELECT
USING (is_coach_of(auth.uid(), user_id));

-- Coach can read assigned athlete's nutrition_goals
CREATE POLICY "Coaches can view athlete nutrition goals"
ON public.nutrition_goals FOR SELECT
USING (is_coach_of(auth.uid(), user_id));

-- Coach can read assigned athlete's mindset_programmes
CREATE POLICY "Coaches can view athlete mindset programmes"
ON public.mindset_programmes FOR SELECT
USING (is_coach_of(auth.uid(), user_id));
