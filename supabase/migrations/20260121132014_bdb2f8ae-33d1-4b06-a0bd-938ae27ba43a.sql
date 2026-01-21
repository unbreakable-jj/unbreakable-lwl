-- Create friendships table for friend relationships
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Prevent self-friending
  CONSTRAINT no_self_friendship CHECK (requester_id != addressee_id),
  -- Prevent duplicate requests (either direction)
  CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id)
);

-- Create indexes for efficient queries
CREATE INDEX idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Everyone can view friendships (needed for friend counts, mutual friends)
CREATE POLICY "Friendships are viewable by everyone"
  ON public.friendships FOR SELECT
  USING (true);

-- Users can send friend requests
CREATE POLICY "Users can send friend requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Users can update friendships they're part of (accept/decline)
CREATE POLICY "Users can update their friendships"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can delete friendships they're part of
CREATE POLICY "Users can delete their friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Update trigger for updated_at
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add visibility column to runs table for friends-only posts
ALTER TABLE public.runs 
ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public' 
CHECK (visibility IN ('public', 'friends', 'private'));

-- Update existing runs: set visibility based on is_public
UPDATE public.runs SET visibility = CASE WHEN is_public = true THEN 'public' ELSE 'private' END;

-- Create function to check if two users are friends
CREATE OR REPLACE FUNCTION public.are_friends(user1 UUID, user2 UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
    AND (
      (requester_id = user1 AND addressee_id = user2)
      OR (requester_id = user2 AND addressee_id = user1)
    )
  );
$$;

-- Drop old run policy and create new one with visibility support
DROP POLICY IF EXISTS "Public runs are viewable by everyone" ON public.runs;

CREATE POLICY "Runs are viewable based on visibility"
  ON public.runs FOR SELECT
  USING (
    -- Owner can always see their own runs
    auth.uid() = user_id
    -- Public runs visible to all
    OR visibility = 'public'
    -- Friends-only runs visible to friends
    OR (visibility = 'friends' AND public.are_friends(auth.uid(), user_id))
  );