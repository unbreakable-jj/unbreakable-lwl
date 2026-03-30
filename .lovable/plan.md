

## Plan: Session Notes 5-media limit + Manual Builder scroll fix

### Task 1: Increase session notes media to 5 combined uploads

**Current state**: `SessionNotesView.tsx` limits to 3 images + 1 video separately.

**Change**: Replace with a single combined limit of 5 — any mix of images and videos.

**File: `src/components/programming/SessionNotesView.tsx`**
- Change `MAX_IMAGES = 3` to `MAX_MEDIA = 5`
- Remove separate image/video limits — just check `media.length < MAX_MEDIA`
- Show both Add Photo and Add Video buttons as long as total < 5
- Update validation toast to say "Maximum 5 attachments per session"
- Label text updated: "Attach up to 5 photos or videos"

---

### Task 2: Fix Manual Programme Builder scroll/layout

**Current state**: The exercise list and library sit in a `grid lg:grid-cols-2` layout. The exercise list uses `ScrollArea` with a fixed `h-[400px]`, but the entire builder card has no overflow handling — on mobile (434px viewport), adding exercises makes the card grow unbounded, and the library panel stacks below off-screen with no way to scroll.

**Fix in `src/components/programming/ManualProgramBuilder.tsx`**:

1. **Make the outer builder card scrollable**: Wrap the exercise list + library area in a container with `max-h-[60vh] overflow-y-auto` so the whole day content scrolls on mobile
2. **On mobile, show library as a full-screen sheet/drawer** instead of stacking it below the exercise list (where it's unreachable) — use the existing `Sheet` component to overlay the `InlineExerciseLibrary`
3. **Remove the fixed `h-[400px]`** on the exercise ScrollArea — let it flex within the scrollable parent with `flex-1 min-h-0 overflow-y-auto`
4. **Sticky header**: Keep the day selector and "ADD EXERCISE" button visible while scrolling exercises
5. **Collapse the `lg:grid-cols-2`** layout for mobile — on small screens use a single column with the library in a sheet overlay

This ensures exercises are always scrollable and the library is always accessible regardless of how many exercises are added.

