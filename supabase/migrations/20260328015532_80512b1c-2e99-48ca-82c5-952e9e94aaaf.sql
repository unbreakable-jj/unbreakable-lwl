CREATE TABLE public.university_chapter_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  level integer NOT NULL,
  unit_number integer NOT NULL,
  chapter_number integer NOT NULL,
  score integer NOT NULL,
  total integer NOT NULL,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  attempted_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.university_chapter_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own chapter quizzes"
  ON public.university_chapter_quizzes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own chapter quizzes"
  ON public.university_chapter_quizzes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);