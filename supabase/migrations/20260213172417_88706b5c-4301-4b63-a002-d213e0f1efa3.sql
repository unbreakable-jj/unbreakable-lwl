
-- Add activity_type column to runs table
ALTER TABLE public.runs ADD COLUMN activity_type text NOT NULL DEFAULT 'run';

-- Migrate existing data from notes field
UPDATE public.runs SET activity_type = notes WHERE notes IN ('walk', 'run', 'cycle');

-- Add index for filtering by activity type
CREATE INDEX idx_runs_activity_type ON public.runs (activity_type);
