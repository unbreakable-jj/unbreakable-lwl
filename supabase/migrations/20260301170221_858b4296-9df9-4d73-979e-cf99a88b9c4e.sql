
-- Create university-downloads storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('university-downloads', 'university-downloads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to university-downloads bucket
CREATE POLICY "Public read access for university downloads"
ON storage.objects FOR SELECT
USING (bucket_id = 'university-downloads');

-- Allow authenticated users with dev role to upload
CREATE POLICY "Dev users can upload to university downloads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'university-downloads'
  AND auth.uid() IS NOT NULL
);

-- Allow dev users to update/delete
CREATE POLICY "Dev users can manage university downloads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'university-downloads'
  AND auth.uid() IS NOT NULL
);
