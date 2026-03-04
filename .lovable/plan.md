

## Plan: Athlete Feedback Response Experience

### Problem
Athletes can only view and delete coach feedback. They cannot respond, acknowledge, or reply to feedback entries. The athlete's `CoachUpdatesView` is a read-only list with no interaction beyond delete.

### Solution

#### 1. Database: Add `feedback_responses` table
A new table to store athlete replies/acknowledgements against specific coaching feedback entries.

```sql
CREATE TABLE public.feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES public.coaching_feedback(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  response_type TEXT NOT NULL DEFAULT 'reply', -- 'reply', 'acknowledged'
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

RLS policies:
- Athletes can INSERT responses on feedback addressed to them
- Athletes can SELECT their own responses
- Coaches can SELECT responses on feedback they created
- Devs can manage all
- Athletes can DELETE their own responses

#### 2. Update `CoachUpdatesView` — Full Feedback Experience
Transform the current read-only collapsible list into an interactive feedback experience:

- **Acknowledge button**: One-tap "Acknowledged" stamp on a feedback entry (inserts a response with type `acknowledged`)
- **Reply input**: Text area + send button within each expanded feedback card for the athlete to reply
- **Response thread**: Display all responses (athlete replies + acknowledgements) beneath the feedback content in chronological order
- **Visual indicators**: Show "Acknowledged" badge and reply count on collapsed cards so coaches can see engagement at a glance

#### 3. Coach Visibility
Update `useCoachingFeedback` hook to add a `getResponsesForFeedback(feedbackId)` function so the coach's `AthleteDataViewer` Feedback tab also shows athlete responses inline.

#### 4. Notification
When an athlete responds, insert a notification to the coach:
- Type: `feedback_response`
- Body: "Your athlete replied to feedback: [title]"

### Files to Edit
- **New migration**: Create `feedback_responses` table + RLS + notification trigger
- `src/hooks/useCoachingFeedback.tsx` — Add `respondToFeedback`, `acknowledgeFeedback`, `getResponsesForFeedback` functions
- `src/components/coaching/CoachUpdatesView.tsx` — Add acknowledge button, reply input, response thread display
- `src/components/coaching/AthleteDataViewer.tsx` — Show athlete responses in the Feedback tab

### No Additional Questions Needed
The scope is clear: replicate the full feedback interaction from athlete side with respond, acknowledge, and reply capabilities.

