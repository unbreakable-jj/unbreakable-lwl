-- Add activity_type to personal_records so PRs can be filtered by walk/run/cycle
ALTER TABLE public.personal_records 
ADD COLUMN activity_type text NOT NULL DEFAULT 'run';

-- Backfill existing records from the linked run's activity_type
UPDATE public.personal_records pr
SET activity_type = COALESCE(r.activity_type, 'run')
FROM public.runs r
WHERE pr.run_id = r.id;