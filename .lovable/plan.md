

## Complete Pro Images for Power Level 3, Unit 2 — Remaining Gaps

### What's done
- **Ch1** (4 sections with content): All 4 have images ✓
- **Ch2** (4 sections): 3 have images. **Ch2 "Matching the Method"** — no image (but it's a short bridging paragraph, skip)
- **Ch3** (4 sections): 2 have images. Missing: **"Volume Progression"** and **"Individual Variation"**
- **Ch4** (4 sections): 1 has image. Missing: **"Type I and Type II Fibres"**, **"Practical Training Implications"**, **"The Practical Takeaway"**
- **Ch5** (5 sections): 1 has image. Missing: **"Understanding Tempo Notation"**, **"The Concentric Phase"**, **"Isometric Pauses"**, **"When to Use Tempo Training"**
- **Ch6** (4 sections): 1 has image. Missing: **"Why Deloading Matters"**, **"When to Deload"**, **"Common Deload Mistakes"**
- **Ch7** (4 sections): 1 has image. Missing: **"What Is the Mind-Muscle Connection?"**, **"What the Research Shows"**, **"Practical Application"**
- **Ch8** (6 sections): 1 has image. Missing: **"When Standard Sets Are Not Enough"**, **"Drop Sets"**, **"Cluster Sets"**, **"Myo-Reps"**, **"Programming Considerations"**

### Already-generated but NOT wired in
These assets exist on disk but have no `import` or `imageUrl` in unit2.ts:
- `l3-u2-ch3-volume-ramp.png`
- `l3-u2-ch4-fibre-comparison.png`
- `l3-u2-ch4-rep-range-zones.png`
- `l3-u2-ch5-tempo-notation.png`
- `l3-u2-ch5-isometric-pauses.png`
- `l3-u2-ch6-fitness-fatigue.png`
- `l3-u2-ch6-deload-strategies.png`
- `l3-u2-ch7-neural-focus.png`

### Plan

**Step 1 — Wire existing assets** (no generation needed)
Import all 8 already-generated images into `unit2.ts` and assign them to their matching content sections.

**Step 2 — Generate remaining Pro images** (~12 new images, one at a time, premium model)
Target 3-5 images per chapter total. Prioritize sections with bullets or complex concepts. Skip very short bridging paragraphs.

New images needed:
| Chapter | Section | Asset name |
|---------|---------|------------|
| Ch3 | Individual Variation | `l3-u2-ch3-individual-variation.png` |
| Ch5 | Understanding Tempo Notation | already have `tempo-notation.png` — wire it |
| Ch5 | Concentric Phase | `l3-u2-ch5-concentric-phase.png` |
| Ch6 | Why Deloading Matters | already have `fitness-fatigue.png` — wire it |
| Ch6 | Common Deload Mistakes | `l3-u2-ch6-deload-myths.png` |
| Ch7 | What Is the Mind-Muscle Connection? | `l3-u2-ch7-mmc-concept.png` |
| Ch7 | Practical Application | `l3-u2-ch7-practical-cues.png` |
| Ch8 | Drop Sets | `l3-u2-ch8-drop-sets.png` |
| Ch8 | Cluster Sets | `l3-u2-ch8-cluster-sets.png` |
| Ch8 | Myo-Reps | `l3-u2-ch8-myo-reps.png` |

That's **7 new images** to generate + **8 existing images** to wire = full coverage.

**Step 3 — Build verification**
Run `npm run build` to confirm all imports resolve and types are correct.

### Files modified
- `src/lib/university/level3/unit2.ts` — add imports and `imageUrl`/`imageAlt` to ~15 additional content sections
- `src/assets/university/` — 7 new PNG files

### Execution
All done in one pass: wire existing → generate remaining one-at-a-time with premium model → wire each immediately → build check at the end.

