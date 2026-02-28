

# Dashboard Rework: Dev, Coach & Athlete Coaching Page

## Overview

Clean up and consolidate the Dev Dashboard and Coach Dashboard layouts, removing duplication and improving visual hierarchy. Then create a dedicated `/my-coaching` page for athletes to view their coach, feedback history, and assigned plans.

---

## 1. Dev Dashboard (Admin.tsx) -- Consolidate Tabs

**Problem**: Currently has 6 tabs including "ATHLETES", "CLIENTS", and "USERS" which overlap. The "ATHLETES" tab embeds the entire CoachDashboard (which itself has sub-tabs including another "USERS" tab), creating confusing nested navigation.

**Solution**: Restructure to 2 clear sections:

```text
+-----------------------------------------------+
|  DEV DASHBOARD                                 |
|  Logged in as DEV                              |
+-----------------------------------------------+
|  COACHING | USERS | REPORTS | SETTINGS | LOGS  |
+-----------------------------------------------+
```

- **COACHING** tab: Embeds the cleaned-up CoachDashboard (athletes, search users, requests, quick build actions -- all in one)
- Remove the standalone "CLIENTS" tab (merged into CoachDashboard's USERS sub-tab)
- **USERS** tab: AdminUsersPanel (full user management with roles, suspend, delete)
- **REPORTS**, **SETTINGS**, **LOGS**: Unchanged

---

## 2. CoachDashboard.tsx -- Visual Rework

Redesign the layout for a cleaner, more professional look. Same design for both dev and coach roles.

**Header**: Compact role badge + dashboard title (no large icon circle)

**Quick Actions Row**: Two action cards side-by-side with dropdowns (keep current BUILD MY OWN / BUILD FOR ATHLETE pattern but improve styling):
- Tighter padding, subtle gradient borders, icon + label only (remove sub-description text)
- The BUILD FOR ATHLETE dropdown uses a cleaner scrollable list with avatars

**Tabs**: Keep 3 tabs (ATHLETES, USERS, REQUESTS) but improve content:

- **ATHLETES tab**: 
  - Summary stat bar at top: total athletes count, pending requests count
  - Athlete cards: Avatar + name + username on left; action buttons (Message, View, Build Plan dropdown) on right with a compact `...` more menu instead of multiple visible buttons
  - Empty state with a clear CTA to search users

- **USERS tab**: ClientSearchPanel (unchanged, already clean)

- **REQUESTS tab**: Cleaner request cards with Accept/Decline as primary/ghost buttons

**Empty state text fix**: Change "Use the CLIENTS tab" to "Use the USERS tab"

---

## 3. New Page: `/my-coaching` -- Athlete Coaching Hub

A dedicated page for athletes (regular users) who have an assigned coach. Accessible from the COACHING nav item.

**Layout**:
```text
+-----------------------------------------------+
|  MY COACHING                                   |
+-----------------------------------------------+
|  YOUR COACH                                    |
|  [Avatar] Coach Name  @username     [MESSAGE]  |
+-----------------------------------------------+
|  UPDATES | MY PLANS                            |
+-----------------------------------------------+
|  (Coach feedback cards / assigned plans)        |
+-----------------------------------------------+
```

**Content**:
- **Coach Card** at top: Shows assigned coach's avatar, name, username, and MESSAGE button
- **UPDATES tab**: Renders the existing `CoachUpdatesView` component (feedback history from coach)
- **MY PLANS tab**: Shows plans assigned by the coach (training, cardio, meal, mindset programmes where the user_id matches but was created by the coach). Uses existing data from the save hooks.

**No coach state**: If user has no coach, show a clean empty state: "You don't have a coach yet. Request one from your profile or wait for an assignment."

**Navigation routing**: The COACHING nav item will route to `/my-coaching` for regular users and `/coach` for coach/dev roles.

---

## 4. Profile Page Cleanup

Since the athlete now has a dedicated `/my-coaching` page:
- Remove the "COACH UPDATES" tab from `Profile.tsx`
- Keep the `RequestCoachCard` on Profile as a subtle info card
- Profile page returns to a single-view layout (no tabs needed)

---

## 5. Navigation Update

Update the COACHING nav link logic:
- If user role is `coach` or `dev`: navigate to `/coach` (Coach Dashboard)
- If user role is `user` and has an active coach: navigate to `/my-coaching`
- If user role is `user` and has no coach: navigate to `/my-coaching` (shows empty state with request option)

---

## Files Summary

**New file:**
- `src/pages/MyCoaching.tsx` -- Dedicated athlete coaching page

**Modified files:**
- `src/pages/Admin.tsx` -- Remove "CLIENTS" tab, rename "ATHLETES" to "COACHING"
- `src/pages/CoachDashboard.tsx` -- Visual rework: cleaner cards, better layout, compact actions
- `src/pages/Profile.tsx` -- Remove Coach Updates tab, simplify back to single view
- `src/App.tsx` -- Add `/my-coaching` route
- `src/components/MainNavigation.tsx` or relevant nav component -- Update COACHING link routing based on user role

