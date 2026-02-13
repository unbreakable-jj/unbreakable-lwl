
# UNBREAKABLE Fuel Recipe Packs Integration

## Overview
Load the complete Low-Carb (40 recipes) and High Protein (52 recipes) recipe packs into the platform as pre-loaded, public recipes available to all users. Each recipe includes full macro tracking, ingredient breakdowns, food photography from the original guides, simplified instructions, and integration with the food library for individual ingredient logging.

## What Users Will See

**Recipe Library ("UNBREAKABLE RECIPES" page):**
- A new "UNBREAKABLE PACKS" tab alongside existing tabs (All, My Recipes, Favourites, Community)
- Two browsable packs: "LOW-CARB PACK" and "HIGH PROTEIN PACK"
- Each recipe card shows the food photo, name, macros, dietary tags (GF, DF, LC, HP, V, Q, MP, N), prep/cook time
- Tapping a recipe opens a full detail view with:
  - Hero food photo
  - Simplified step-by-step instructions (numbered, concise)
  - Full ingredient list with individual macro values
  - Nutrition summary per serving
  - Dietary badges
  - "LOG THIS MEAL" button (logs the whole recipe as one food entry)
  - "LOG INGREDIENTS" button (adds individual ingredients to food library for granular tracking)

**Food Library Integration:**
- Each recipe's ingredients are also stored as individual food items in the `saved_foods`-compatible format
- Users can search for "chicken breast", "cottage cheese" etc. and find pre-loaded entries with accurate macros
- Ingredients from recipes are trackable via the barcode scanner food search

## Technical Implementation

### Phase 1: Storage Bucket + Recipe Images
1. Create a `recipe-images` public storage bucket
2. Upload all food photos extracted from the PDFs (one per recipe, ~90 images) to the bucket
3. Map each image to its recipe name

### Phase 2: Recipe Data File
Create `src/lib/unbreakableRecipes.ts` - a comprehensive data file containing all 90+ recipes structured as:

```text
{
  name: "Turmeric Poached Egg",
  pack: "low-carb",
  category: "breakfast",
  servings: 2,
  prep_time_minutes: 10,
  cook_time_minutes: 5,
  calories_per_serving: 219,
  protein_g: 14,
  carbs_g: 12,
  fat_g: 15,
  dietary_tags: ["gluten-free", "dairy-free", "low-carb", "vegetarian", "quick"],
  image_key: "turmeric-poached-egg.jpg",
  ingredients: [
    { name: "Pine nuts", quantity: "2 tsp", calories: 38, protein_g: 1, carbs_g: 1, fat_g: 4 },
    { name: "Fresh spinach", quantity: "400g", calories: 92, protein_g: 11, carbs_g: 14, fat_g: 1 },
    ...
  ],
  instructions: [
    "Toast pine nuts in a dry pan for 2 minutes, then set aside.",
    "Heat oil, stir-fry spinach and tomatoes for 2 minutes until wilted. Season.",
    "Boil water with vinegar and turmeric. Reduce to a simmer, poach eggs for 3 minutes each.",
    "Divide spinach into bowls, top with egg, sprinkle pine nuts. Season and serve."
  ]
}
```

This file will contain all 40 low-carb + 52 high protein recipes with simplified instructions.

### Phase 3: Database Seeding Edge Function
Create an edge function `seed-unbreakable-recipes` that:
1. Reads the recipe data
2. Inserts recipes into the `recipes` table as public recipes (`is_public = true`, `user_id = null`)
3. Inserts each recipe's ingredients into `recipe_ingredients`
4. Can be called once to populate, with idempotency checks (skips if already seeded)

**Database changes needed:**
- Make `recipes.user_id` allow NULL (for system/platform recipes) -- it already allows NULL based on schema
- Add a `pack` column (text, nullable) to `recipes` table to categorize recipes into packs
- Add a `category` column (text, nullable) to `recipes` table for meal type (breakfast, lunch, dinner, treats, smoothies)
- Update RLS on `recipes` to ensure public recipes with `user_id IS NULL` are readable by all authenticated users (current policy already covers `is_public = true`)

### Phase 4: Recipe Library UI Updates
Update `RecipeLibrary.tsx`:
1. Add "UNBREAKABLE PACKS" tab to the TabsList
2. Within packs tab, show two collapsible sections: "LOW-CARB PACK" and "HIGH PROTEIN PACK"
3. Recipe cards display the food photo from storage, macros, dietary badges
4. Recipe detail modal enhanced with:
   - Hero image display
   - Ingredient list with individual nutritional info
   - "LOG THIS MEAL" button that logs the full recipe to food tracker
   - "SAVE INGREDIENTS" button that saves all ingredients to user's food library
   - Simplified numbered instructions
5. Filter by category (Breakfast, Lunch, Dinner, Treats, Smoothies) within each pack

### Phase 5: Food Library Integration
Update `FoodLibrary.tsx`:
1. Add an "UNBREAKABLE FOODS" source alongside existing "My Foods" / "Favourites" / "Search Database" tabs
2. Pre-populate with common ingredients from the recipe packs (chicken breast, eggs, salmon, quinoa, etc.)
3. Users can save any ingredient to their personal library with one tap
4. These items appear in food search results when logging meals

### Phase 6: Coach + Meal Plan Integration
Update the `help-chat` and `generate-meal-plan` edge functions:
1. Add the UNBREAKABLE recipe library as a reference (similar to exercise library approach)
2. When generating meal plans, prioritise recipes from the UNBREAKABLE packs
3. Coach can reference specific recipes by name and link users to them

## Execution Order
Due to the size of this task (90+ recipes with full data), implementation will be split across multiple rounds:

1. **Round 1**: Database schema changes (add `pack` and `category` columns) + storage bucket + create the recipe data file (first batch: Low-Carb Pack - 40 recipes)
2. **Round 2**: Complete recipe data file (High Protein Pack - 52 recipes) + upload all recipe images to storage
3. **Round 3**: Seeding edge function + run initial seed
4. **Round 4**: Recipe Library UI updates (packs tab, detail modal, image display)
5. **Round 5**: Food Library integration (ingredient tracking) + Coach/meal plan reference updates

## Branding
- All headings use UNBREAKABLE branding: "UNBREAKABLE LOW-CARB PACK", "UNBREAKABLE HIGH PROTEIN PACK"
- Neon glow styling on pack headers and badges
- Recipe cards use neon-border-subtle on hover
- Pack descriptions include motivational copy: "FUEL WITH REAL INTENT. KEEP SHOWING UP."
- Dietary tag badges styled with the UNBREAKABLE colour palette
