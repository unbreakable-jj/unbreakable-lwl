-- Add confidence rating (1-5) and pain flag to exercise_logs
ALTER TABLE public.exercise_logs 
ADD COLUMN confidence_rating smallint NULL,
ADD COLUMN pain_flag boolean NULL DEFAULT false;

-- Add check constraint for confidence rating range
ALTER TABLE public.exercise_logs 
ADD CONSTRAINT exercise_logs_confidence_rating_check 
CHECK (confidence_rating IS NULL OR (confidence_rating >= 1 AND confidence_rating <= 5));