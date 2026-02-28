

# Comprehensive Navigation, Coaching & Messaging Overhaul

## Overview

This plan restructures navigation to consolidate feature modules into a single "COACHING HUB" dropdown, creates a dedicated Coach dashboard (separate from Dev), adds direct client management for both roles, removes user-facing coach request functionality, and fixes all messaging issues including the broken `?to=` parameter and direct coach-athlete chat linking.

---

## 1. Navigation Restructure

### Mobile Drawer (`NavigationDrawer.tsx`)
Consolidate CALCULATORS, POWER, MOVEMENT, FUEL, MINDSET, COACHING, and UNIVERSITY into a collapsible "COACHING HUB" section using an accordion/collapsible pattern. Keep HOME, MY PROFILE, COACH (for coach role), and DEV (for dev role) as standalone top-level items.

**New structure:**
- HOME
- COACHING HUB (collapsible)
  - Calculators
  - Power
  - Movement
  - Fuel
  - Mindset
  - AI Coaching
  - University
- MY PROFILE
- COACH (visible only to `coach` role)
- DEV (visible only to `dev` role)
- SIGN OUT

### Desktop Navigation (`MainNavigation.tsx`)
Replace all the individual dropdown triggers (CALCULATORS, POWER, MOVEMENT, etc.) with a single "COACHING HUB" mega-dropdown containing all sub-items grouped by category. Keep MY PROFILE and role-specific links (COACH, DEV) as separate nav items.

---

## 2. Coach Dashboard (New Standalone Page)

Create a **separate Coach-specific dashboard** at `/coach` with its own route protection (requires `coach` role only, NOT dev). This mirrors the Admin page style but is scoped for coaches.

### Coach Dashboard Tabs:
- **ATHLETES** - List of assigned athletes (reuses existing `CoachDashboard` component embedded)
- **CLIENTS** - New searchable user list to find and directly assign clients for 1:1 coaching
- **REQUESTS** - Pending coaching requests (moved from combined Athletes tab)

### File: `src/pages/CoachDashboard.tsx`
Refactor to serve as the full coach page (not just embeddable component). Add a new "CLIENTS" tab with a user search interface (using existing `useUserSearch` hook) and ability to directly assign users as clients.

### Route Protection
Create `CoachProtectedRoute.tsx` - similar to `AdminProtectedRoute` but checks for `coach` role specifically (not dev). The `/coach` route will use this.

---

## 3. Dev Dashboard Updates (`Admin.tsx`)

Add a new **CLIENTS** tab to the Dev dashboard (same as Coach gets) so devs can also search and add clients directly. This reuses the same client search/assign component.

---

## 4. Shared Client Search & Assign Component

### New File: `src/components/coaching/ClientSearchPanel.tsx`
A reusable component used by both Coach and Dev dashboards:
- Full user search with existing `useUserSearch` hook
- Shows user avatar, name, username
- "ADD CLIENT" button that calls `useCoachingAssignments.assignCoach()` to create an active assignment directly (no request flow)
- Shows existing clients inline so you don't duplicate assignments

---

## 5. Remove Client Coach Request Flow

### `src/components/coaching/RequestCoachCard.tsx`
Remove this component entirely (or gut it to only show "Your Coach" info if they have one assigned, with a "Message Coach" button).

### `src/pages/Profile.tsx`
Remove the `<RequestCoachCard />` import and usage. Replace with a simple "YOUR COACH" display card if they have an assigned coach, showing a direct "MESSAGE COACH" button.

---

## 6. Fix Messaging - Critical Bugs

### Bug 1: `?to=` parameter not handled in Inbox
**File: `src/pages/Inbox.tsx`**

In the `useEffect` that handles `compose=1`, also read the `to` parameter. If present, automatically call `startConversation(toUserId)` and open that conversation.

```
// Pseudocode for the fix:
const compose = searchParams.get('compose');
const toUserId = searchParams.get('to');
if (compose === '1' && toUserId) {
  // Auto-start conversation with that user
  startConversation(toUserId).then(({ conversation }) => {
    if (conversation) setSelectedConversationId(conversation.id);
  });
} else if (compose === '1') {
  setNewMessageOpen(true);
}
```

### Bug 2: User search in NewMessageDialog not finding profiles
The `useUserSearch` hook searches `profiles` table using `ilike` on `display_name` and `username`. This should work, but the issue may be that the user_settings `allow_messages` privacy check in `start_or_get_conversation` RPC is rejecting. Review and ensure the `can_message_user` function allows coaches/devs to message any user regardless of privacy settings.

**Database migration** - Update `can_message_user` function to allow coaches to bypass message restrictions for their assigned athletes:
```sql
CREATE OR REPLACE FUNCTION public.can_message_user(sender_id uuid, recipient_id uuid)
RETURNS boolean AS $$
  SELECT CASE
    WHEN sender_id = recipient_id THEN true
    WHEN is_coach_of(sender_id, recipient_id) THEN true
    WHEN is_coach_of(recipient_id, sender_id) THEN true
    WHEN (SELECT allow_messages FROM public.user_settings WHERE user_id = recipient_id) = 'everyone' THEN true
    WHEN (SELECT allow_messages FROM public.user_settings WHERE user_id = recipient_id) = 'friends'
      AND are_friends(sender_id, recipient_id) THEN true
    WHEN (SELECT allow_messages FROM public.user_settings WHERE user_id = recipient_id) = 'none' THEN false
    ELSE are_friends(sender_id, recipient_id)
  END;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## 7. Direct Coach Chat Link

### For Users with an Assigned Coach
On the Profile page (or wherever the coach card appears), the "MESSAGE COACH" button navigates to `/inbox?compose=1&to={coachId}` -- which will now work after Bug 1 fix above.

### For Coaches/Devs Messaging Athletes
The existing buttons in CoachDashboard and AthleteDataViewer already use `/inbox?compose=1&to={athleteId}` -- will also now work.

---

## 8. Coach Plan Delivery (Building & Saving Plans to User Profiles)

Coaches and devs can already use the site's AI programme builders (Power, Movement, Fuel). To deliver plans to specific athletes:

### Approach
In the Coach/Dev athlete view (`AthleteDataViewer.tsx`), add a "BUILD PLAN" action that navigates to the appropriate builder (e.g., `/programming/create`, `/tracker/create`, `/fuel/planning`) with a query parameter `?for={athleteId}`. The builder pages will detect this parameter and save the programme to the athlete's profile instead of the coach's own.

### Files to modify:
- `src/components/coaching/AthleteDataViewer.tsx` - Add "BUILD PLAN" dropdown with Power/Movement/Fuel options
- `src/hooks/useAIProgramme.tsx` - Accept optional `forUserId` to save under athlete's ID
- `src/hooks/useAIMealPlan.tsx` - Same
- `src/pages/ProgrammingCreate.tsx` - Read `?for=` param, pass to builder
- `src/pages/TrackerCreate.tsx` - Same
- `src/pages/FuelPlanning.tsx` - Same

This requires a database consideration: coaches need INSERT permission on `training_programs`, `cardio_programs`, and `meal_plans` for their athletes. Add RLS policies:
```sql
CREATE POLICY "Coaches can create programs for athletes"
ON training_programs FOR INSERT
WITH CHECK (is_coach_of(auth.uid(), user_id));
```
(Same pattern for cardio_programs and meal_plans/meal_plan_items.)

---

## 9. Media Uploads in Coach Chat

The inbox already supports image and video uploads via `ChatMediaUpload` component. The `ChatMediaUpload` is already rendered in the message input area. Verify that the upload limits (5MB images, 500MB videos) and the storage buckets (`post-images`, `post-videos`) are accessible. No code changes needed here -- this already works.

---

## Summary of Files

**New files:**
- `src/components/coaching/ClientSearchPanel.tsx` - Shared client search/assign component
- `src/components/coaching/CoachProtectedRoute.tsx` - Coach-only route guard

**Modified files:**
- `src/components/NavigationDrawer.tsx` - Consolidate into COACHING HUB collapsible
- `src/components/MainNavigation.tsx` - Single COACHING HUB dropdown
- `src/pages/CoachDashboard.tsx` - Full standalone coach page with CLIENTS tab
- `src/pages/Admin.tsx` - Add CLIENTS tab
- `src/pages/Inbox.tsx` - Fix `?to=` parameter handling
- `src/pages/Profile.tsx` - Remove RequestCoachCard, add simple coach display
- `src/components/coaching/AthleteDataViewer.tsx` - Add BUILD PLAN actions
- `src/components/coaching/RequestCoachCard.tsx` - Remove or simplify to display-only
- `src/App.tsx` - Update `/coach` route protection
- `src/hooks/useUserRole.tsx` - Add `isCoach` helper

**Database migrations:**
- Update `can_message_user` to allow coach-athlete messaging
- Add INSERT RLS policies for coaches on training_programs, cardio_programs, meal_plans, meal_plan_items

