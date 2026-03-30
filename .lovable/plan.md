

## Add 3-5 Pro Images Per Chapter — Power Level 3 (All 4 Units)

### Current state
Level 3 has **32 chapters** (4 units × 8 chapters) with exactly **1 image each** — already generated and wired in. Each chapter has 3-5 content sections, so 2-4 sections per chapter currently lack visuals.

### Approach
Same proven workflow as Level 2: generate one image at a time using the Pro model (`google/gemini-3-pro-image-preview`), dark charcoal background with neon orange accents, clean legible labels. QA each before moving on.

### Scope per unit (~24-32 new images each, ~100-120 total)

**Unit 1 — Advanced Nutrition** (8 chapters: Macro Periodisation, Nutrient Timing, Supplementation, Body Composition, Metabolic Adaptation, Calorie Cycling, Gut Health, Goal-Specific Nutrition)
- Each chapter gets 2-4 additional diagrams targeting sections that currently have no image (e.g. "The Three Core Phases", "Pre-Workout Nutrition", "Practical Application")

**Unit 2 — Advanced Training Science** (8 chapters: Hypertrophy Mechanisms, Progressive Overload, Volume Landmarks, Muscle Fibre Types, Mind-Muscle Connection, Advanced Techniques, Deload Strategies, Conjugate/Concurrent)
- Diagrams for mechanisms, fibre type comparisons, technique breakdowns, deload protocols

**Unit 3 — Advanced Programming** (8 chapters: Periodisation Models, Exercise Selection, Training Splits, Autoregulation/RPE, Weak Point Analysis, Peaking/Tapering, Training Age, Programme Design)
- Diagrams for split comparisons, RPE scales, peaking curves, programme templates

**Unit 4 — Psychology & Adherence** (8 chapters: Consistency, Habit Formation, Stress Management, Sleep, Injury/Detraining, Social Support, Self-Talk, Long-Term Planning)
- Diagrams for habit loops, stress-recovery balance, sleep architecture, identity models

### Process (per image)
1. Generate with Pro model — detailed prompt matching existing visual style
2. Save to `src/assets/university/` with naming convention `l3-uX-chY-description.png`
3. QA for legibility and accuracy
4. Import and wire into the chapter content data file
5. Move to next image

### Files modified
- `src/lib/university/level3/unit1.ts` through `unit4.ts` — add imports and `imageUrl`/`imageAlt` to additional content sections
- `src/assets/university/` — ~100-120 new image files

### Execution order
Unit 1 first (generate all additional images, wire them in), then Units 2, 3, 4 sequentially. Progress will be shared after each unit.

