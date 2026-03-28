

## Plan: Navigation Relabelling + Session Logging UX Fix

### 1. Rename "HOME" tab to "TIMELINE"

**Files affected:**
- `src/components/hub/SocialHeader.tsx` — change `HOME` label to `TIMELINE`
- `src/components/PageNavigation.tsx` — change `{ path: '/', label: 'HOME' }` to `TIMELINE`
- `src/components/NavigationDrawer.tsx` — change the `HOME` link text to `TIMELINE`
- `src/components/tracker/TrackerHeader.tsx` — change `Feed` label to `Timeline` (same concept)

### 2. Rename "UNBREAKABLE PROGRAMMING" to "UNBREAKABLE HOME"

**File affected:**
- `src/components/NavigationDrawer.tsx` line 144 — change collapsible trigger label from `UNBREAKABLE PROGRAMMING` to `UNBREAKABLE HOME`

### 3. Fix Session Logging Scroll + Rest Timer UX

**Problem:** The `SessionLoggingView` has nested scrolling (outer `FullScreenToolView` + inner `h-[calc(100vh-180px)] overflow-y-auto`), the `CompactRestTimer` is a sticky card at the bottom that overlaps content and interferes with scrolling/input interactions. It's always fully expanded even when not in use.

**Solution — Collapsible Rest Timer:**

In `SessionLoggingView.tsx`:
- Remove the nested scroll container — let the `FullScreenToolView` handle the single scroll
- Make the rest timer collapsible: when idle (not running), show only a minimal pill/bar (timer icon + time + tap to expand). When running or tapped, expand to full controls
- Add a `minimized` state that defaults to `true`. Timer auto-expands when started (set completion triggers it), auto-minimizes 3 seconds after completion
- Reduce z-index and use `pointer-events-none` on the timer overlay when minimized so it doesn't block scroll or dropdowns

In `CompactRestTimer.tsx`:
- Add a `minimized` prop and `onToggleMinimize` callback
- When minimized: render a single-line bar showing the timer icon, countdown, and a chevron-up tap target (~40px tall)
- When expanded: show current full UI
- Remove the presets row when space is tight (move to expanded-only)

**Result:** Single scroll context, rest timer stays accessible but out of the way, no more scroll/dropdown interference.

### Files Changed (5 total)

| File | Change |
|------|--------|
| `SocialHeader.tsx` | HOME → TIMELINE |
| `PageNavigation.tsx` | HOME → TIMELINE |
| `NavigationDrawer.tsx` | HOME → TIMELINE, UNBREAKABLE PROGRAMMING → UNBREAKABLE HOME |
| `SessionLoggingView.tsx` | Remove nested scroll, add timer minimize state |
| `CompactRestTimer.tsx` | Add minimized/expanded modes |

