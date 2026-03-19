
-- Table for multiple media items per post
CREATE TABLE public.post_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  width INTEGER,
  height INTEGER,
  duration_seconds NUMERIC,
  file_size_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_post_media_post_id ON public.post_media(post_id);
CREATE INDEX idx_post_media_user_id ON public.post_media(user_id);

-- RLS
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;

-- Anyone can view media for visible posts
CREATE POLICY "Anyone can view post media"
  ON public.post_media FOR SELECT
  USING (true);

-- Users can insert their own media
CREATE POLICY "Users can insert own media"
  ON public.post_media FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own media
CREATE POLICY "Users can delete own media"
  ON public.post_media FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
