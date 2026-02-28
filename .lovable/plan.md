

# Coaching Hub: Feedback, Appraisals & Auto-Notifications

## Overview

Build a complete coaching feedback system where coaches/devs can review athlete data, write structured appraisals, set session goals, edit existing plans, and save feedback -- automatically notifying the client via inbox with a link to a dedicated "Coach Updates" view on their profile.

---

## 1. New Database Table: `coaching_feedback`

Create a `coaching_feedback` table to store structured appraisals from coaches to athletes.

```text
coaching_feedback
  id              UUID PK
  coach_id        UUID NOT NULL (auth user)
  athlete_id      UUID NOT NULL (auth user)
  feedback_type   TEXT ('session_review', 'appraisal', 'goal_setting', 'plan_update', 'general')
  title           TEXT NOT NULL
  performance_rating  INTEGER (1-5, nullable)
  technique_notes TEXT (nullable)
  next_session_goals TEXT (nullable)
  general_comments TEXT (nullable)
  related_session_id UUID (nullable, FK to workout_sessions)
  related_program_id UUID (nullable, FK to training_programs)
  data            JSONB (flexible extra data)
  created_at      TIMESTAMPTZ DEFAULT now()
  updated_at      TIMESTAMPTZ DEFAULT now()
```

**RLS Policies:**
- Coaches can INSERT for their assigned athletes (`is_coach_of(auth.uid(), athlete_id)`)
- Coaches can SELECT/UPDATE their own feedback (`coach_id = auth.uid()`)
- Athletes can SELECT feedback addressed to them (`athlete_id = auth.uid()`)
- Devs can do all (via `has_role(auth.uid(), 'dev')`)

---

## 2. Auto-Notification on Feedback Save

### Database trigger: `notify_athlete_on_coaching_feedback`

A trigger on `coaching_feedback` INSERT that automatically creates a row in the `notifications` table for the athlete:

```text
type: 'coaching_feedback'
title: 'Coach Update'
body: 'Your coach has left new feedback: {title}'
data: { feedback_id: <id>, coach_id: <coach_id>, type: <feedback_type> }
```

This leverages the existing `notifications` table and `useNotifications` hook with realtime subscription -- so the client sees it instantly.

### Auto-message to inbox

Additionally, the trigger (or client-side logic after saving) will send an automated message to the coach-athlete conversation via `start_or_get_conversation` + message insert, containing a clickable link text like: "Your coach has posted new feedback. View it in your Coach Updates."

---

## 3. Coach Feedback Panel (New Component)

### File: `src/components/coaching/CoachFeedbackPanel.tsx`

A structured appraisal card component used within `AthleteDataViewer`:

- **Title** field (required)
- **Feedback Type** selector (Session Review, Appraisal, Goal Setting, Plan Update, General)
- **Performance Rating** (1-5 stars/badges)
- **Technique Notes** textarea
- **Next Session Goals** textarea
- **General Comments** textarea
- **Link to Session** (optional dropdown of recent sessions)
- **Link to Programme** (optional dropdown of athlete's programmes)
- **SAVE & NOTIFY** button -- saves to `coaching_feedback`, triggers notification + auto-message

---

## 4. Athlete "Coach Updates" View

### File: `src/components/coaching/CoachUpdatesView.tsx`

A dedicated view accessible from the athlete's Profile page showing all feedback from their coach:

- Chronological list of feedback cards
- Each card shows: title, type badge, performance rating, technique notes, goals, comments, date
- Linked session/programme names are clickable
- Unread indicator (based on notifications read state)

### Integration into Profile page (`src/pages/Profile.tsx`)

Add a "COACH UPDATES" section/tab that appears when the user has an assigned coach. When notifications with `type: 'coaching_feedback'` are clicked, navigate to `/profile?tab=coach-updates&feedback={id}`.

---

## 5. Enhance AthleteDataViewer with Feedback Tab

### File: `src/components/coaching/AthleteDataViewer.tsx`

Add a new **"Feedback"** tab alongside Training, Habits, Fuel, Records:

- Shows the `CoachFeedbackPanel` for writing new feedback
- Shows history of all previous feedback for this athlete
- Each historical entry is expandable to view full details

---

## 6. Coach Can Edit Existing Athlete Programmes

### Database: New RLS UPDATE policies

Add UPDATE policies for coaches on their assigned athletes' programmes:

```sql
CREATE POLICY "Coaches can update athlete programs"
ON training_programs FOR UPDATE
USING (is_coach_of(auth.uid(), user_id));

CREATE POLICY "Coaches can update athlete cardio"
ON cardio_programs FOR UPDATE
USING (is_coach_of(auth.uid(), user_id));

CREATE POLICY "Coaches can update athlete meal plans"
ON meal_plans FOR UPDATE
USING (is_coach_of(auth.uid(), user_id));

CREATE POLICY "Coaches can update athlete meal plan items"
ON meal_plan_items FOR UPDATE
USING (is_coach_of(auth.uid(), user_id));
```

### AthleteDataViewer: "EDIT" button on programmes

In the Training tab, each programme card gets an "EDIT" button that navigates to the programme builder with `?edit={programId}&for={athleteId}`. The builder pages will detect this and load the existing programme for editing.

---

## 7. New Hook: `useCoachingFeedback`

### File: `src/hooks/useCoachingFeedback.tsx`

- `createFeedback(data)` -- inserts into `coaching_feedback`, then sends auto-message to inbox
- `getFeedbackForAthlete(athleteId)` -- coach fetching feedback they wrote
- `getMyCoachFeedback()` -- athlete fetching feedback addressed to them
- `updateFeedback(id, data)` -- edit existing feedback

The auto-message logic:
1. Call `start_or_get_conversation` RPC to get/create the coach-athlete conversation
2. Insert a system-style message: "New coach update: {title}. View your Coach Updates in your profile."

---

## 8. Notification Click Routing

### File: `src/components/hub/NotificationsPanel.tsx`

Add handling for `type: 'coaching_feedback'` notifications:
- On click, navigate to `/profile?tab=coach-updates&feedback={data.feedback_id}`

---

## Summary of Changes

**New database objects:**
- Table: `coaching_feedback` with RLS
- Trigger: `notify_athlete_on_coaching_feedback` (inserts into `notifications`)
- UPDATE RLS policies on `training_programs`, `cardio_programs`, `meal_plans`, `meal_plan_items` for coaches
- Enable realtime on `coaching_feedback`

**New files:**
- `src/components/coaching/CoachFeedbackPanel.tsx` -- structured feedback form
- `src/components/coaching/CoachUpdatesView.tsx` -- athlete-facing feedback history
- `src/hooks/useCoachingFeedback.tsx` -- CRUD + auto-message logic

**Modified files:**
- `src/components/coaching/AthleteDataViewer.tsx` -- add Feedback tab + edit buttons on programmes
- `src/pages/Profile.tsx` -- add Coach Updates section
- `src/components/hub/NotificationsPanel.tsx` -- route coaching_feedback notification clicks

