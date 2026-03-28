
-- Step 1: Add course_type column to all 3 tables
ALTER TABLE public.university_progress ADD COLUMN course_type text NOT NULL DEFAULT 'gym';
ALTER TABLE public.university_assessments ADD COLUMN course_type text NOT NULL DEFAULT 'gym';
ALTER TABLE public.university_chapter_quizzes ADD COLUMN course_type text NOT NULL DEFAULT 'gym';

-- Step 2: Drop old unique constraint and add new one including course_type
ALTER TABLE public.university_progress DROP CONSTRAINT university_progress_user_id_level_unit_number_chapter_numbe_key;
ALTER TABLE public.university_progress ADD CONSTRAINT university_progress_unique_entry UNIQUE (user_id, course_type, level, unit_number, chapter_number);
