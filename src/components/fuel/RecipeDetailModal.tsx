import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Recipe, RecipeIngredient } from '@/lib/fuelTypes';
import {
  Clock,
  Users,
  Flame,
  Star,
  ChefHat,
  UtensilsCrossed,
  Zap,
  Wheat,
  Droplets,
  BookOpen,
  ShoppingCart,
  CheckCircle2,
} from 'lucide-react';

const DIETARY_TAG_FULL: Record<string, { label: string; color: string }> = {
  GF: { label: 'Gluten-Free', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  DF: { label: 'Dairy-Free', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  LC: { label: 'Low-Carb', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  HP: { label: 'High Protein', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  V: { label: 'Vegetarian', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  VG: { label: 'Vegan', color: 'bg-lime-500/20 text-lime-400 border-lime-500/30' },
  Q: { label: 'Quick', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  MP: { label: 'Meal Prep', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  N: { label: 'Contains Nuts', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
};

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  ingredients: RecipeIngredient[];
  onClose: () => void;
  onToggleFavourite: (id: string) => void;
  onLogMeal: (recipe: Recipe) => void;
}

export function RecipeDetailModal({
  recipe,
  ingredients,
  onClose,
  onToggleFavourite,
  onLogMeal,
}: RecipeDetailModalProps) {
  if (!recipe) return null;

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
  const instructions = recipe.instructions?.split('\n').filter(Boolean) || [];

  // Calculate macro percentages for visual bars
  const totalMacroGrams = (recipe.protein_g || 0) + (recipe.carbs_g || 0) + (recipe.fat_g || 0);
  const proteinPct = totalMacroGrams > 0 ? ((recipe.protein_g || 0) / totalMacroGrams) * 100 : 0;
  const carbsPct = totalMacroGrams > 0 ? ((recipe.carbs_g || 0) / totalMacroGrams) * 100 : 0;
  const fatPct = totalMacroGrams > 0 ? ((recipe.fat_g || 0) / totalMacroGrams) * 100 : 0;

  return (
    <Dialog open={!!recipe} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Hero Section */}
        <div className="relative">
          {recipe.image_url ? (
            <div className="w-full h-56 sm:h-72 overflow-hidden">
              <img
                src={recipe.image_url}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-40 bg-muted/30 flex items-center justify-center">
              <UtensilsCrossed className="w-16 h-16 text-muted-foreground/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
          )}

          {/* Floating badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {recipe.pack && (
              <Badge className="bg-primary/90 text-primary-foreground font-display tracking-wider text-xs backdrop-blur-sm">
                {recipe.pack === 'low-carb' ? '🥬 LOW-CARB' : '💪 HIGH PROTEIN'}
              </Badge>
            )}
            {recipe.category && (
              <Badge variant="secondary" className="capitalize backdrop-blur-sm text-xs">
                {recipe.category}
              </Badge>
            )}
          </div>

          {/* Favourite button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80"
            onClick={() => onToggleFavourite(recipe.id)}
          >
            <Star
              className={`w-5 h-5 ${recipe.is_favourite ? 'text-primary fill-primary' : 'text-foreground'}`}
            />
          </Button>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="font-display text-2xl sm:text-3xl tracking-wide text-foreground leading-tight">
              {recipe.name}
            </h2>
            {recipe.pack && (
              <p className="text-xs font-display tracking-widest text-primary mt-1 neon-glow-subtle">
                UNBREAKABLE {recipe.pack === 'low-carb' ? 'LOW-CARB' : 'HIGH PROTEIN'} PACK
              </p>
            )}
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Quick Stats Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-display text-xs tracking-wide text-muted-foreground">PREP</p>
                <p className="font-semibold text-sm">{recipe.prep_time_minutes || 0} min</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                <Flame className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-display text-xs tracking-wide text-muted-foreground">COOK</p>
                <p className="font-semibold text-sm">{recipe.cook_time_minutes || 0} min</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-display text-xs tracking-wide text-muted-foreground">TOTAL</p>
                <p className="font-semibold text-sm">{totalTime} min</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-display text-xs tracking-wide text-muted-foreground">SERVES</p>
                <p className="font-semibold text-sm">{recipe.servings}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {recipe.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">{recipe.description}</p>
          )}

          {/* Dietary Tags - Full Labels */}
          {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.dietary_tags.map((tag) => {
                const tagInfo = DIETARY_TAG_FULL[tag];
                return (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`text-xs font-medium ${tagInfo?.color || ''}`}
                  >
                    {tagInfo?.label || tag}
                  </Badge>
                );
              })}
            </div>
          )}

          <Separator />

          {/* Nutrition Breakdown */}
          <div>
            <h3 className="font-display text-sm tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              NUTRITION PER SERVING
            </h3>

            <Card className="p-4 border-primary/20 neon-border-subtle">
              {/* Calorie highlight */}
              <div className="text-center mb-4">
                <p className="font-display text-4xl text-primary neon-glow-subtle">
                  {recipe.calories_per_serving || 0}
                </p>
                <p className="text-xs font-display tracking-widest text-muted-foreground">CALORIES</p>
              </div>

              {/* Macro bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-red-400" />
                      Protein
                    </span>
                    <span className="font-display text-sm">{recipe.protein_g || 0}g</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full transition-all"
                      style={{ width: `${proteinPct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium flex items-center gap-1.5">
                      <Wheat className="w-3 h-3 text-amber-400" />
                      Carbs
                    </span>
                    <span className="font-display text-sm">{recipe.carbs_g || 0}g</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${carbsPct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium flex items-center gap-1.5">
                      <Droplets className="w-3 h-3 text-sky-400" />
                      Fat
                    </span>
                    <span className="font-display text-sm">{recipe.fat_g || 0}g</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 rounded-full transition-all"
                      style={{ width: `${fatPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Macro split summary */}
              <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1" />
                  {Math.round(proteinPct)}% Protein
                </span>
                <span className="text-[10px] text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />
                  {Math.round(carbsPct)}% Carbs
                </span>
                <span className="text-[10px] text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full bg-sky-400 mr-1" />
                  {Math.round(fatPct)}% Fat
                </span>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Ingredients */}
          <div>
            <h3 className="font-display text-sm tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              INGREDIENTS
              {ingredients.length > 0 && (
                <Badge variant="outline" className="ml-auto text-[10px]">
                  {ingredients.length} items
                </Badge>
              )}
            </h3>

            {ingredients.length > 0 ? (
              <div className="space-y-0">
                {ingredients.map((ing, i) => (
                  <div
                    key={ing.id}
                    className={`flex items-start justify-between py-3 ${
                      i < ingredients.length - 1 ? 'border-b border-border/40' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-primary/40 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{ing.name}</p>
                        {ing.quantity && ing.unit && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {ing.quantity} {ing.unit}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      {ing.calories != null && (
                        <p className="text-xs font-display text-primary">{ing.calories} kcal</p>
                      )}
                      <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                        {ing.protein_g != null && <span>P: {ing.protein_g}g</span>}
                        {ing.carbs_g != null && <span>C: {ing.carbs_g}g</span>}
                        {ing.fat_g != null && <span>F: {ing.fat_g}g</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Ingredient details not yet available for this recipe.
              </p>
            )}
          </div>

          <Separator />

          {/* Method / Instructions */}
          {instructions.length > 0 && (
            <div>
              <h3 className="font-display text-sm tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                METHOD
              </h3>

              <div className="space-y-4">
                {instructions.map((step, i) => {
                  const cleanStep = step.replace(/^\d+\.\s*/, '');
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center border border-primary/30">
                          <span className="font-display text-sm text-primary">{i + 1}</span>
                        </div>
                      </div>
                      <div className="pt-1">
                        <p className="text-sm leading-relaxed text-foreground">{cleanStep}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Separator />

          {/* UNBREAKABLE Branding Footer */}
          <div className="text-center py-2">
            <p className="font-display text-xs tracking-[0.3em] text-primary/60 neon-glow-subtle">
              FUEL WITH PURPOSE • KEEP SHOWING UP
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 pb-1 sticky bottom-0 bg-background/95 backdrop-blur-sm -mx-5 px-5 border-t border-border/50">
            <Button
              className="flex-1 font-display tracking-wide h-12"
              onClick={() => onLogMeal(recipe)}
            >
              <Flame className="w-5 h-5 mr-2" />
              LOG THIS MEAL
            </Button>
            <Button
              variant="outline"
              className="flex-1 font-display tracking-wide h-12 border-primary/40 text-primary hover:bg-primary/10"
              onClick={() => onToggleFavourite(recipe.id)}
            >
              <Star
                className={`w-5 h-5 mr-2 ${recipe.is_favourite ? 'fill-primary' : ''}`}
              />
              {recipe.is_favourite ? 'SAVED' : 'SAVE RECIPE'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
