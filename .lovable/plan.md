

## Add 3-5 Images Per Chapter — Power Level 2, Starting Unit 1

### Current state
Each chapter in Power Level 2 currently has **1 image** (already generated and stored in `src/assets/university/`). The `ContentSection` type already supports `imageUrl` and `imageAlt` per section. The `ChapterContent` renderer already displays images when present. No code changes needed — this is purely a content + asset generation task.

### Approach
For each chapter, identify 3-4 additional key sections that would benefit from a visual diagram. The existing image stays. We generate new images one at a time using the locked-in pro model (`google/gemini-3-pro-image-preview`), review each, then add it to the content data file.

### Power Level 2 Unit 1 — Image Plan

**Chapter 1: Basic Anatomy for Training** (currently 1 image: anatomical planes)
- Add: **Directional Terms** — labelled human figure showing anterior/posterior/medial/lateral/superior/inferior
- Add: **Applying This in the Gym** — split view showing 3 exercises classified by movement plane
- **Total: 3 images**

**Chapter 2: The Skeletal System** (currently 1 image: joint types)
- Add: **What the Skeleton Does** — skeleton diagram with 5 functions labelled (support, protection, movement, mineral storage, blood cell production)
- Add: **Joint Health and Training** — diagram showing synovial joint cross-section with cartilage, synovial fluid, and warm-up effects
- **Total: 3 images**

**Chapter 3: The Muscular System** (currently 1 image: muscle groups)
- Add: **Types of Muscle Contraction** — side-by-side showing concentric/eccentric/isometric with bicep curl example
- Add: **Agonist and Antagonist Pairs** — diagram showing biceps/triceps and quads/hamstrings pairs with arrows
- **Total: 3 images**

**Chapter 4: The Cardiovascular System** (currently 1 image: heart/cardio)
- Add: **Cardiovascular System Overview** — simple circulatory system diagram showing heart, arteries, veins, capillaries
- Add: **Acute Responses to Exercise** — infographic showing the 5 acute responses during exercise
- Add: **Chronic Adaptations** — before/after comparison showing cardiac hypertrophy, capillary density, VO2 max improvements
- **Total: 4 images**

**Chapter 5: Energy Systems** (currently 1 image: energy systems chart)
- Add: **Where Energy Comes From** — ATP molecule breakdown diagram
- Add: **How They Work Together** — timeline showing energy system dominance across exercise duration
- Add: **Practical Implications** — infographic mapping rep ranges to energy systems and rest periods
- **Total: 4 images**

### Process (per image)
1. Generate image using `google/gemini-3-pro-image-preview` with the dark technical diagram style (neon orange accents on charcoal background, clean legible labels)
2. Save to `src/assets/university/` with descriptive filename
3. QA the image for legibility and accuracy
4. Import and wire into the chapter content data in `src/lib/university/level2/unit1.ts`
5. Move to next image

### Files modified
- `src/lib/university/level2/unit1.ts` — add `imageUrl` and `imageAlt` to additional content sections, add new imports
- `src/assets/university/` — ~15 new image files for Unit 1

### After Unit 1
We proceed to Units 2, 3, and 4 of Power Level 2 with the same approach, then move to Fuel and Mindset tracks.

