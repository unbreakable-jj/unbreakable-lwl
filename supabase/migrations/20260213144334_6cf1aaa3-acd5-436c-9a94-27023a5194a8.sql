
-- Add pack and category columns to recipes table
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS pack text;
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS category text;

-- Create recipe-images storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to recipe images
CREATE POLICY "Recipe images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-images');

-- Allow authenticated users to upload recipe images
CREATE POLICY "Authenticated users can upload recipe images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'recipe-images' AND auth.uid() IS NOT NULL);
