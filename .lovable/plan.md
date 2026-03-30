

## Fix: Multi-media story viewer not advancing through slides

### Problem
When a story has multiple `media_items`, the viewer only shows the first image. The auto-advance timer calls `nextStory()` directly instead of cycling through slides first. Tap navigation also skips slides entirely.

### Root cause (StoriesSection.tsx)
1. **Timer** (line 47): After `STORY_DURATION`, calls `nextStory()` immediately — never advances `activeMediaSlide`
2. **Tap/click handlers** (lines 193-210): Call `prevStory()`/`nextStory()` directly — never cycle through slides within a story
3. **Progress bars** (lines 323-336): Only show per-story segments, not per-slide within a story

### Plan

**File: `src/components/hub/StoriesSection.tsx`**

1. **Fix auto-advance timer** — When the current story has multiple media_items, advance `activeMediaSlide` first. Only call `nextStory()` when on the last slide. Adjust the progress calculation to reflect slide-level progress.

2. **Fix tap/click navigation** — In `handleViewerClick` and touch handlers, if the current story has multi-media:
   - Tap right: go to next slide first, then next story when on last slide
   - Tap left: go to previous slide first, then previous story when on first slide

3. **Fix progress bars** — Show progress segments per-slide (not per-story) when viewing a multi-media story. E.g. a story with 3 images shows 3 progress segments that fill sequentially.

4. **Reset `activeMediaSlide` to 0** when changing stories (already done in `nextStory`/`prevStory` — verify consistency).

### Technical detail
- Create a `nextSlideOrStory` callback that checks `mediaArr.length` and either increments `activeMediaSlide` or calls `nextStory()`
- Create a `prevSlideOrStory` callback similarly
- Replace direct `nextStory`/`prevStory` calls in click/touch handlers and timer with these new functions
- Progress bar: compute total segments as `Math.max(1, mediaArr?.length || 1)` for the current story, rendering that many bars

