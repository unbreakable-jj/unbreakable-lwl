

## Pro Images for Power Level 3, Unit 3 — Programme Design (8 Chapters)

### Current state
Unit 3 has 8 chapters, each with exactly 1 image. Each chapter has 4-6 content sections, leaving 3-5 sections per chapter without visuals.

### Images to generate (~20 total, one at a time, premium model)

**Ch1 — Periodisation Models** (currently 1 image on DUP section)
- `l3-u3-ch1-linear-periodisation.png` — Ascending load / descending reps staircase across 12 weeks
- `l3-u3-ch1-block-periodisation.png` — Three-block diagram: Accumulation → Transmutation → Realisation
- `l3-u3-ch1-conjugate-method.png` — Weekly layout showing max effort, dynamic effort, and repetition days

**Ch2 — Exercise Selection & Order** (currently 1 image on Selection Criteria)
- `l3-u3-ch2-compound-vs-isolation.png` — Side-by-side comparison of multi-joint vs single-joint with muscle group activation maps
- `l3-u3-ch2-sfr-comparison.png` — Stimulus-to-fatigue ratio comparison (barbell row vs chest-supported row)

**Ch3 — Training Splits** (currently 1 image on Upper/Lower)
- `l3-u3-ch3-full-body-layout.png` — 3-day full body weekly calendar with muscle frequency highlighted
- `l3-u3-ch3-ppl-layout.png` — 6-day PPL rotation with push/pull/legs groupings

**Ch4 — Auto-Regulation** (currently 1 image on RPE)
- `l3-u3-ch4-autoregulation-flow.png` — Decision flowchart: assess readiness → adjust load/volume/stop
- `l3-u3-ch4-rir-scale.png` — RIR scale 0-4 with corresponding RPE values and training zone labels

**Ch5 — Weak Point Training** (currently 1 image on Identifying)
- `l3-u3-ch5-priority-strategies.png` — 5-column layout of strategies (priority placement, volume, exercise selection, isolation, frequency)
- `l3-u3-ch5-common-fixes.png` — Table of common weak points with specific exercise solutions

**Ch6 — Peaking & Tapering** (currently 1 image on Tapering)
- `l3-u3-ch6-taper-types.png` — Three-line graph comparing linear, step, and exponential tapers
- `l3-u3-ch6-strength-peak.png` — Final 2-week peaking timeline for strength testing

**Ch7 — Training Ages** (currently 1 image on Beginner)
- `l3-u3-ch7-intermediate-framework.png` — Intermediate programme framework with DUP/block elements
- `l3-u3-ch7-advanced-framework.png` — Advanced programme complexity diagram with periodisation layers

**Ch8 — Putting It All Together** (currently 1 image on 12-week example)
- `l3-u3-ch8-design-process.png` — 7-step sequential flowchart of the programme design process
- `l3-u3-ch8-review-cycle.png` — Circular feedback loop: Execute → Measure → Evaluate → Adjust

### Execution
Generate one image at a time using premium model, dark charcoal + neon orange style. Wire each into `unit3.ts` immediately. Build check at end.

### Files modified
- `src/lib/university/level3/unit3.ts` — add ~20 new imports and `imageUrl`/`imageAlt` entries
- `src/assets/university/` — ~20 new PNG files

