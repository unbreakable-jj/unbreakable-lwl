

## Plan: Remove "ALL" tab and pack dropdown from Recipe Library

**What changes:**

1. **Remove "ALL" from category tabs** — Delete the first entry `{ value: 'all', label: 'ALL', icon: '🔥' }` from `CATEGORY_TABS` array (line 70). Set default `activeCategory` state to `'breakfast'` instead of `'all'`.

2. **Remove the pack dropdown selector** — Remove the `<Select>` component for `activePack` (lines 323-334) and the `PACK_OPTIONS` constant (lines 79-86). Remove the `activePack` state variable. Remove the pack filtering logic in `getFilteredRecipes()` (lines 135-141).

3. **Keep filter button and create button** — The dietary tag filter button and CREATE button remain in the search row, just without the dropdown.

**Files to edit:**
- `src/components/fuel/RecipeLibrary.tsx` — Remove ALL tab, pack dropdown, and related state/logic

