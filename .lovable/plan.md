
# Fix: Exercise Library Scroll in Live Session Swap Sheet

## Problem
When swapping an exercise during a live programme session, the exercise list in the swap sheet cannot be scrolled. This happens because:

1. The Radix `ScrollArea` component requires an explicit **height** (not just `max-height`) to calculate its scrollable viewport
2. The parent `SheetContent` has `overflow-y-auto` creating a competing scroll context that swallows touch/scroll events
3. The Sheet (portal) renders on top of a Dialog (portal), and z-index stacking may interfere

## Solution

### File: `src/components/programming/ExerciseSwapSheet.tsx`

**Change 1 - Fix SheetContent overflow:**
Replace `max-h-[80vh] overflow-y-auto` with `max-h-[80vh] flex flex-col` so the sheet uses flexbox layout instead of its own scroll, delegating all scrolling to the inner `ScrollArea`.

**Change 2 - Fix ScrollArea height:**
Replace `max-h-[50vh]` on the `ScrollArea` with `flex-1 min-h-0` so it fills the remaining sheet space and enables proper Radix scroll viewport calculation. Also wrap the search + list in a `flex flex-col flex-1 min-h-0` container.

**Change 3 - Ensure z-index layering:**
Add a higher z-index class (e.g. `z-[60]`) to the Sheet to ensure it renders above the Dialog overlay (`z-50`).

### Summary of changes

```
Before:
  SheetContent: max-h-[80vh] overflow-y-auto  (competes with ScrollArea)
    ScrollArea: max-h-[50vh]                   (no explicit height = broken)

After:
  SheetContent: max-h-[80vh] flex flex-col     (no overflow, flex layout)
    Header: (fixed size)
    Content: flex-1 min-h-0 flex flex-col      (fills remaining space)
      Search: (fixed size)
      ScrollArea: flex-1 min-h-0               (gets real height from flex)
```

This is a single-file fix targeting `ExerciseSwapSheet.tsx` only.
