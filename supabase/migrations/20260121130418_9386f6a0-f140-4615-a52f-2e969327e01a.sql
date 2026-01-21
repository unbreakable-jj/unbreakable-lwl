-- Add comments_enabled column to runs table
ALTER TABLE public.runs 
ADD COLUMN comments_enabled boolean NOT NULL DEFAULT true;

-- Create index for faster comment lookups
CREATE INDEX IF NOT EXISTS idx_comments_run_id ON public.comments(run_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);

-- Create index for faster kudos lookups
CREATE INDEX IF NOT EXISTS idx_kudos_run_id ON public.kudos(run_id);

-- Add unique constraint to prevent duplicate kudos
ALTER TABLE public.kudos 
ADD CONSTRAINT unique_user_run_kudos UNIQUE (user_id, run_id);

-- Add ON DELETE CASCADE for kudos and comments when a run is deleted
-- First drop existing foreign keys if they exist, then recreate with CASCADE
DO $$ 
BEGIN
  -- Check if foreign key exists before trying to drop
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'kudos_run_id_fkey' AND table_name = 'kudos') THEN
    ALTER TABLE public.kudos DROP CONSTRAINT kudos_run_id_fkey;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'comments_run_id_fkey' AND table_name = 'comments') THEN
    ALTER TABLE public.comments DROP CONSTRAINT comments_run_id_fkey;
  END IF;
END $$;

-- Add foreign keys with CASCADE delete
ALTER TABLE public.kudos
ADD CONSTRAINT kudos_run_id_fkey 
FOREIGN KEY (run_id) REFERENCES public.runs(id) ON DELETE CASCADE;

ALTER TABLE public.comments
ADD CONSTRAINT comments_run_id_fkey 
FOREIGN KEY (run_id) REFERENCES public.runs(id) ON DELETE CASCADE;