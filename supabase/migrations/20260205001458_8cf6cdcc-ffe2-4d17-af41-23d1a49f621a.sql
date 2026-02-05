-- Fix profiles table RLS policy to restrict access to authenticated users only
-- and respect user privacy settings

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create new restrictive policy that:
-- 1. Requires authentication (no anonymous access)
-- 2. Users can always see their own profile
-- 3. Public profiles (is_public = true) are visible to authenticated users
-- 4. Friends can see private profiles of their friends
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id -- Can always see own profile
  OR is_public = true -- Public profiles visible to authenticated users
  OR are_friends(auth.uid(), user_id) -- Friends can see each other's profiles
);