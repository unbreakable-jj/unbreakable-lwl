# Unbreakable Recipe eBook -- PDF Generation & University Downloads

## Overview

Build a branded, categorised PDF recipe ebook from the full recipe library (all 198 recipes across Low-Carb, High Protein, and Unbreakable packs). The ebook will feature the Unbreakable logo, "Fuel Your Results" subhead, macro breakdowns per recipe, and categorised sections (Breakfast, Lunch, Main, Snacks, Desserts, Shakes). The finished PDF will be the first downloadable content on the University page.

---

## Approach

Since this is a client-side app, we'll use an edge function to generate the PDF server-side using `jsPDF` (available in Deno). The edge function will fetch all public recipes from the database, organise them by category, and build a styled PDF with cover page, table of contents, and recipe pages. The PDF will be stored in a storage bucket for download.

---

## 1. Create Storage Bucket for University Downloads

A new `university-downloads` storage bucket (public read) to host the generated ebook PDF.

**Database migration:**

- Create the bucket via SQL or use the storage API in the edge function
- Public read access policy so any user can download

## 2. New Edge Function: `generate-recipe-ebook`

**File:** `supabase/functions/generate-recipe-ebook/index.ts`

This function will:

1. Fetch all public recipes from the `recipes` table, ordered by category
2. Fetch all `recipe_ingredients` for those recipes
3. Build a PDF using `jsPDF` (available via `https://esm.sh/jspdf`):
  - **Cover Page**: Unbreakable logo (embedded as base64), "UNBREAKABLE" title, "FUEL YOUR RESULTS" subhead, "KEEP SHOWING UP" tagline, recipe count
  - **Table of Contents**: Category sections with page numbers
  - **Category Divider Pages**: Full-width category headers (BREAKFAST, LUNCH, MAIN, etc.)
  - **Recipe Pages**: Each recipe gets a formatted entry with:
    - Recipe name (bold, large)
    - Pack badge (Low-Carb / High Protein / 5-Ingredient)
    - Dietary tags
    - Prep time, cook time, servings
    - Macro breakdown (Calories, Protein, Carbs, Fat per serving)
    - Ingredients list with quantities
    - Method steps
  - **Footer**: "UNBREAKABLE -- Live Without Limits" on every page
  - **Colour scheme**: Orange (#F97316) headers on dark/white background
4. Upload the generated PDF to the `university-downloads` bucket
5. Return the public URL

The function will be triggered manually (by a dev) or on-demand. The PDF URL is then referenced statically on the University page.

## 3. Copy Unbreakable Logo to Project

Copy the uploaded logo image to `src/assets/unbreakable-shield.png` for use on the University page download card. The edge function will embed the logo as base64 directly.

## 4. Update University Page

**File:** `src/pages/University.tsx`

Replace the "Coming Soon" placeholder with a live downloads section:

- Keep the existing hero and category preview cards
- Add a new "DOWNLOADS" section above the "Coming Soon" card
- Feature the recipe ebook as a download card:
  - Unbreakable shield logo
  - Title: "UNBREAKABLE RECIPE BOOK"
  - Subtitle: "FUEL YOUR RESULTS"
  - Description: "198 high-protein recipes with full macro breakdowns. Categorised by meal type. Your complete nutrition playbook."
  - Stats badges: "198 Recipes", "7 Categories", "Full Macros"
  - Download button that links to the storage bucket URL
  - Neon orange branded styling consistent with the platform

The remaining categories (Training Science, Mindset, Exercise Technique) stay as "Coming Soon" preview cards below.

## 5. Static PDF Alternative (Simpler Path)

Given the complexity of server-side PDF generation with styling, an alternative approach:

- Create a dedicated `/fuel/ebook` page that renders all recipes in a print-optimised layout
- Add CSS `@media print` styles for clean PDF output
- Users click "Download PDF" which triggers `window.print()` with the print stylesheet
- This gives full control over styling using existing React components

**Recommendation:** Use the edge function approach for a proper branded PDF that can be downloaded directly without print dialogs.

---

## Technical Details

### Edge Function PDF Structure

```text
Page 1:     Cover -- Logo, Title, Subhead
Page 2:     Table of Contents
Page 3:     Category Divider: BREAKFAST
Pages 4-X:  Breakfast recipes (2-3 per page)
Page X+1:   Category Divider: LUNCH
...continues for all categories...
Last Page:  Back cover -- "KEEP SHOWING UP"
```

### Recipe Layout Per Entry (within a page)

```text
+------------------------------------------+
| RECIPE NAME                    HP | GF   |
| Prep: 10 min | Cook: 15 min | Serves: 2 |
|------------------------------------------|
| 420 kcal | P: 42g | C: 8g | F: 24g     |
|------------------------------------------|
| INGREDIENTS                              |
| - Sirloin steak, 300g                    |
| - Eggs, 2                               |
| - Fresh spinach, 100g                    |
|------------------------------------------|
| METHOD                                   |
| 1. Season steak and sear 3 min/side      |
| 2. Fry eggs sunny-side up               |
| 3. Serve with spinach and tomatoes       |
+------------------------------------------+
```

### Files Changed/Created


| File                                                | Action                                            |
| --------------------------------------------------- | ------------------------------------------------- |
| `supabase/functions/generate-recipe-ebook/index.ts` | NEW -- PDF generation edge function               |
| `src/assets/unbreakable-shield.png`                 | NEW -- copied from user upload                    |
| `src/pages/University.tsx`                          | MODIFIED -- add downloads section with ebook card |


### Database Changes

- Create `university-downloads` storage bucket with public read policy

### Dependencies

- `jsPDF` via ESM import in the edge function (no npm install needed)
- No new frontend dependencies required

&nbsp;

Be sure to include or hero sub text regarding calories and macros are for reference and user store cupboard being linked direct to fuel planning for bespoke tracking