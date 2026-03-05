ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS motivational_popups_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS cardio_voice_enabled boolean NOT NULL DEFAULT true;