

## Plan: Full-Flow Coach/Dev Athlete Data Viewer Rework

### Current State
The `AthleteDataViewer` has 5 tabs (Training, Habits, Fuel, Records, Feedback) but several gaps:

1. **Training tab** — Shows Power, Movement, Meal Plans, Mindset programmes, session planners, and recent sessions. Only Power programmes have an EDIT button. Movement/Mindset/Meal Plans lack edit capability.
2. **Fuel tab** — Only shows raw food logs. No meal plan visibility, no daily macro summaries, no collapsible grouping.
3. **Records tab** — Only shows personal records (run times). Missing: progression history (weight/rep PRs), workout volume stats.
4. **Feedback tab** — Has the feedback form + collapsible history. Generally functional but could use search/filter for large history.
5. **Habits tab** — Functional but basic.

### Changes Required

#### 1. Training Tab Enhancements
- Add EDIT buttons to **Movement (cardio) programmes** — create a lightweight inline cardio editor or link to the cardio builder with athlete context
- Add EDIT buttons to **Meal Plans** — open inline meal plan editor or navigate to `/fuel/planning` with athlete context
- Make **Session Planners** section a collapsible dropdown, searchable by week/status
- Make **Recent Sessions** section filterable (completed/cancelled/all)
- Add ability for coach to click into a session planner to view its planned exercises

#### 2. Fuel Tab Rework
- Add **Active Meal Plans** section at the top (with collapsible meal plan items by day)
- Add **Daily Macro Summary** — group food logs by date, show daily totals (calories, protein, carbs, fat)
- Keep individual food logs in a collapsible section beneath
- Add **Nutrition Goals** display if athlete has them set

#### 3. Records Tab Rework
- Keep **Personal Records** (running PRs) in a collapsible section
- Add **Progression History** section — fetch from `progression_history` table, show exercise name, previous vs new weight/reps, adjustment reason
- Add **Workout Volume Stats** — total sessions completed (last 30 days), average RPE, total volume
- Group progression history by exercise in collapsible cards

#### 4. Feedback Tab Enhancements
- Add a **search/filter** input at the top of feedback history to filter by type or title
- Keep existing collapsible cards and delete functionality
- No major structural changes needed — already functional

#### 5. Data Fetching
- Load `meal_plan_items` for the athlete's meal plans
- Load `progression_history` for the athlete (last 90 days)
- Load `nutrition_goals` if the table exists
- Load `cardio_session_planners` for movement programme visibility

### Technical Approach
- All changes in `src/components/coaching/AthleteDataViewer.tsx`
- Add collapsible `Collapsible` sections throughout for clean organization
- Use existing Supabase RLS policies (coach policies already exist on all relevant tables)
- No database migrations needed — all tables already have coach SELECT policies

### Files to Edit
- `src/components/coaching/AthleteDataViewer.tsx` — Main rework (all 5 tabs)

