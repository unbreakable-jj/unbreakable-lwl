-- Add video_url column to posts table
ALTER TABLE public.posts ADD COLUMN video_url text;

-- Add video_url column to stories table
ALTER TABLE public.stories ADD COLUMN video_url text;

-- Create a storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-videos', 'post-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for video uploads
CREATE POLICY "Users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'post-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-videos');

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'post-videos' AND auth.uid()::text = (storage.foldername(name))[1]);