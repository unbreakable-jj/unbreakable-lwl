

## Plan: Recipe Cleanup, Category Fix, Desserts, Shopping List Rework, and Store Cupboard Depletion

---

### 1. Recipe Name Cleanup -- Remove "Unbreakable" prefix from Liverpool-inspired meals

**File:** `supabase/functions/seed-liverpool-recipes/index.ts`

All 24 recipes currently prefixed "Unbreakable" need renaming to natural meal names:
- "Unbreakable Eggy Bread" --> "Eggy Bread"
- "Unbreakable Scouse" --> "Scouse"
- "Unbreakable Blind Scouse" --> "Blind Scouse"
- "Unbreakable Wet Nelly" --> "Wet Nelly"
- etc. for all recipes in this function

Also **remove** these recipes entirely:
- "Unbreakable Lobscouse" (redundant with Scouse)
- "Unbreakable Chicken Scouse" (redundant)
- "Unbreakable Sunday Roast Chicken" (keeping Beef only)
- "Unbreakable Sunday Roast Lamb" (keeping Beef only)

**Add** a Toad in the Hole recipe (high-protein version with lean sausages).

After updating the function, execute a database UPDATE to rename existing recipes and DELETE the removed ones. Then re-run the seed function for new recipes.

---

### 2. Add 4-5 Liverpool-inspired Desserts/Cakes/Bakes

**File:** `supabase/functions/seed-liverpool-recipes/index.ts`

Add these as new recipes with `category: 'desserts'` (lowercase to match UI):
1. **Wet Nelly** (already exists -- keep as is, just fix category to lowercase)
2. **Sticky Toffee Pudding** -- High-protein version with dates, protein-enriched sponge
3. **Liverpool Tart** -- Shortcrust pastry with jam and coconut topping
4. **Rice Pudding** -- Creamy baked rice pudding with protein powder and cinnamon
5. **Bread & Butter Pudding** -- Classic with wholemeal bread, eggs, and vanilla custard

---

### 3. Fix Category Mismatch Across All Recipes

**Critical Issue:** The seed-liverpool-recipes uses capitalised categories (`'Breakfast'`, `'Main'`, `'Desserts'`) while the UI filters use lowercase (`'breakfast'`, `'main'`, `'desserts'`). The seed-unbreakable-recipes uses `'treats'` instead of `'desserts'`. The seed-high-protein uses `'dinner'` but the UI has no `'dinner'` tab.

**Fix (database):**
- Run an UPDATE to normalise all recipe categories to lowercase
- Map `'Breakfast'` --> `'breakfast'`, `'Main'` --> `'main'`, `'Desserts'` --> `'desserts'`
- Map `'treats'` --> `'desserts'` (unify treat/dessert categories)
- Map `'dinner'` --> `'main'` (dinner and main are the same tab)

**Fix (seed functions):** Update all three seed files to use lowercase categories going forward.

**Fix (UI `RecipeLibrary.tsx`):** No changes needed to CATEGORY_TABS since they already use lowercase. The filter comparison (`r.category === activeCategory`) will now match correctly.

---

### 4. Generate Images for Recipes Without Them (3 at a time)

The `generate-recipe-images` edge function already processes 3 recipes at a time. After seeding the new/updated recipes, invoke this function repeatedly until all recipes have images. Each call processes 3 recipes that have `image_url IS NULL` and `pack IS NOT NULL`.

---

### 5. Shopping List Rework -- Fix Duplicate Entries

**File:** `src/components/fuel/ShoppingList.tsx`

**Current bug:** The aggregation key is `${normName}-${normUnit}` but ingredient names aren't normalised enough. "Chicken Breast" and "Chicken breast" would create separate entries. Also, items with different units (e.g., "Chicken Breast 300g" vs "Chicken Breast 500g") already aggregate correctly because they share the same unit.

**Fix:**
- Improve the normalisation: capitalise display name while using fully lowercased key
- Add smarter grouping: merge items where the name matches but units differ by converting compatible units (e.g., `g` items into `kg` when total exceeds 1000g)
- Show aggregated totals in a user-friendly format: "Chicken Breast -- 1.2kg total" instead of listing "Chicken Breast 300g" three times
- For items without quantities (custom entries), count occurrences and show "x3" if used in multiple meals

---

### 6. Store Cupboard Auto-Depletion

**Database change:** Add a `quantity_remaining` column to the `saved_foods` table. This tracks how much of a product the user has left.

```sql
ALTER TABLE saved_foods ADD COLUMN quantity_remaining numeric DEFAULT NULL;
ALTER TABLE saved_foods ADD COLUMN quantity_unit text DEFAULT NULL;
```

**Files:** `src/hooks/useSavedFoods.tsx`, `src/lib/storeCupboardMacros.ts`, `src/components/fuel/RecipeLibrary.tsx`, `src/components/fuel/MealPlanExecutionView.tsx`, `src/components/fuel/FoodLibrary.tsx`

**Logic:**
- When a user barcode-scans an item and saves it, they can optionally set a starting quantity (e.g., "1kg chicken breast")
- When a recipe is logged via `handleLogMeal`, after calculating bespoke macros, the system reduces `quantity_remaining` for each matched store cupboard item by the recipe ingredient amount
- The Store Cupboard UI (`FoodLibrary.tsx`) shows remaining stock levels with a visual indicator (green/amber/red bar)
- When an item reaches 0 or below, it shows "OUT OF STOCK" and is visually dimmed
- The store cupboard depletion uses the same fuzzy matching logic from `calculateBespokeMacros`

**New function in `storeCupboardMacros.ts`:**
```typescript
export function depleteStoreCupboard(
  ingredients: RecipeIngredientBasic[],
  storeCupboard: SavedFood[],
  recipeServings: number,
  servingsUsed: number
): { foodId: string; amountUsed: number; unit: string }[]
```

This returns the depletion amounts which are then applied via `supabase.from('saved_foods').update()`.

---

### 7. Link Store Cupboard to Meal Planner and Tracking

**Files:** `src/components/fuel/MealPlanExecutionView.tsx`, `src/components/fuel/RecipeLibrary.tsx`

- When logging a meal from the meal planner execution view, use the same bespoke macro calculation + depletion logic
- When adding a recipe to a meal plan, calculate and display bespoke macros inline (if store cupboard items are available)
- The `handleLogMeal` function in both components will call `depleteStoreCupboard()` after successful logging

---

### Technical Summary

| Change | Files / Actions |
|--------|----------------|
| Remove "Unbreakable" prefix + delete redundant recipes | `seed-liverpool-recipes/index.ts`, DB UPDATE/DELETE |
| Add Toad in the Hole + 4 desserts | `seed-liverpool-recipes/index.ts`, re-seed |
| Fix category casing across all recipes | DB UPDATE, all 3 seed functions |
| Generate missing images | Invoke `generate-recipe-images` function repeatedly |
| Shopping list deduplication | `ShoppingList.tsx` |
| Store cupboard depletion | DB migration (2 columns), `useSavedFoods.tsx`, `storeCupboardMacros.ts`, `FoodLibrary.tsx`, `RecipeLibrary.tsx`, `MealPlanExecutionView.tsx` |

