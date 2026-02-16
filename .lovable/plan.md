

# Fix Post Visibility in Feed

## Investigation Summary

After a thorough audit of the database RLS policies, the `are_friends` function, and all feed-related code, here's what I found:

**Database RLS policies ARE correctly configured.** The SELECT policy on `posts` is:
- Own posts: always visible
- Public posts: visible to all authenticated users
- Friends posts: visible only to accepted friends
- Private posts: visible only to the author

The `are_friends()` function was tested and works correctly.

**However**, there are two potential issues:

1. **All existing posts default to "public"** -- The visibility column defaults to `'public'`, so any post created before visibility was properly wired up shows to everyone. Currently: 14 public posts + 5 friends posts. All 41 workout sessions are public.

2. **No visibility badge shown on feed cards** -- Users can't easily tell which posts are public vs friends vs private in the feed, making it hard to verify the system works.

## Plan

### Step 1: Add Client-Side Visibility Filtering (Defense in Depth)
Add a secondary filter in `useUnifiedFeed.tsx` so that even if RLS somehow leaks data, the client won't display it. This filters out posts that shouldn't be visible based on friendship status.

### Step 2: Add Visibility Badge to Feed Cards
Show a small icon (Globe/Users/Lock) on each feed card so users can confirm what visibility setting each post has. This helps verify the system is working.

### Step 3: Verify Existing Data
All 41 workout sessions are set to "public". If these were intended to be friends-only, they need updating. I'll flag this for your review.

---

## Technical Details

### File Changes

**`src/hooks/useUnifiedFeed.tsx`**
- Import `useFriends` hook to get the current user's friends list
- In the `feedItems` memo, add a client-side filter that removes posts/runs/workouts where:
  - `visibility === 'private'` and `user_id !== currentUser.id`
  - `visibility === 'friends'` and user is NOT in the friends list and `user_id !== currentUser.id`
- This is a backup layer on top of RLS

**`src/components/tracker/StatusCard.tsx`**
- Add a small visibility icon (Globe/Users/Lock) next to the timestamp to show the post's visibility setting

**`src/components/tracker/ActivityCard.tsx`**
- Add the same visibility icon next to the timestamp for run cards

**`src/components/hub/WorkoutCard.tsx`**
- Add the same visibility icon next to the timestamp for workout cards

### Why Both RLS + Client Filtering?
- RLS is the security boundary (server-enforced, cannot be bypassed)
- Client filtering is the UX layer (prevents briefly showing data before RLS kicks in, and acts as safety net)

