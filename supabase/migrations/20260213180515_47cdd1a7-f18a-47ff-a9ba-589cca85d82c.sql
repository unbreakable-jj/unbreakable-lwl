-- Add text_overlays column to store positioned/styled text layers
ALTER TABLE public.stories 
ADD COLUMN text_overlays jsonb DEFAULT '[]'::jsonb;

-- Add background_color for solid color backgrounds
ALTER TABLE public.stories 
ADD COLUMN background_color text DEFAULT NULL;