import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useRecipes } from '@/hooks/useRecipes';
import { Recipe, RecipeIngredient, dietaryTagOptions } from '@/lib/fuelTypes';
import { 
  Plus, 
  Search, 
  Clock, 
  Users, 
  Flame,
  Star,
  ChefHat,
  Filter,
  X,
  UtensilsCrossed,
  Beef,
  Leaf,
  Zap
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { toast } from 'sonner';
import { RecipeDetailModal } from './RecipeDetailModal';

interface RecipeFormData {
  name: string;
  description: string;
  instructions: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  dietary_tags: string[];
  is_public: boolean;
}

const defaultFormData: RecipeFormData = {
  name: '',
  description: '',
  instructions: '',
  prep_time_minutes: 0,
  cook_time_minutes: 0,
  servings: 1,
  calories_per_serving: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  dietary_tags: [],
  is_public: false,
};

const CATEGORY_TABS = [
  { value: 'all', label: 'ALL', icon: '🔥' },
  { value: 'breakfast', label: 'BREAKFAST', icon: '🌅' },
  { value: 'lunch', label: 'LUNCH', icon: '🥗' },
  { value: 'dinner', label: 'DINNER', icon: '🍽️' },
  { value: 'snack', label: 'SNACKS', icon: '⚡' },
  { value: 'treats', label: 'TREATS', icon: '🍫' },
  { value: 'smoothie', label: 'SMOOTHIES', icon: '🥤' },
];

const PACK_OPTIONS = [
  { value: 'all', label: 'All Packs' },
  { value: 'low-carb', label: '🥬 Low-Carb Pack' },
  { value: 'high-protein', label: '💪 High Protein Pack' },
  { value: '5-ingredient', label: '🔥 5-Ingredient Pack' },
  { value: 'mine', label: '📝 My Recipes' },
  { value: 'favourites', label: '⭐ Favourites' },
];

const DIETARY_TAG_MAP: Record<string, string> = {
  'GF': 'Gluten-Free',
  'DF': 'Dairy-Free',
  'LC': 'Low-Carb',
  'HP': 'High Protein',
  'V': 'Vegetarian',
  'VG': 'Vegan',
  'Q': 'Quick',
  'MP': 'Meal Prep',
  'N': 'Contains Nuts',
};

export function RecipeLibrary() {
  const { user } = useAuth();
  const { recipes, myRecipes, favouriteRecipes, isLoading, createRecipe, deleteRecipe, toggleFavourite } = useRecipes();
  const { addFoodLog } = useFoodLogs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<RecipeFormData>(defaultFormData);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePack, setActivePack] = useState('all');
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);

  // Fetch ingredients for the viewed recipe
  const { data: recipeIngredients } = useQuery({
    queryKey: ['recipe-ingredients', viewingRecipe?.id],
    queryFn: async () => {
      if (!viewingRecipe?.id) return [];
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', viewingRecipe.id)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as RecipeIngredient[];
    },
    enabled: !!viewingRecipe?.id,
  });

  const getFilteredRecipes = () => {
    let filtered = recipes || [];

    // Pack filter
    if (activePack === 'mine') {
      filtered = myRecipes;
    } else if (activePack === 'favourites') {
      filtered = favouriteRecipes;
    } else if (activePack !== 'all') {
      filtered = filtered.filter((r) => r.pack === activePack);
    }

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter((r) => r.category === activeCategory);
    }

    // Search
    if (searchQuery) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((r) =>
        selectedTags.some((tag) => r.dietary_tags?.includes(tag))
      );
    }

    return filtered;
  };

  const handleCreateRecipe = async () => {
    await createRecipe.mutateAsync({
      ...formData,
      is_favourite: false,
    });
    setShowCreateModal(false);
    setFormData(defaultFormData);
  };

  const handleLogMeal = async (recipe: Recipe) => {
    try {
      await addFoodLog.mutateAsync({
        food_name: recipe.name,
        calories: recipe.calories_per_serving || 0,
        protein_g: recipe.protein_g || 0,
        carbs_g: recipe.carbs_g || 0,
        fat_g: recipe.fat_g || 0,
        meal_type: 'lunch',
        servings: 1,
        logged_at: new Date().toISOString(),
        recipe_id: recipe.id,
      });
      toast.success('LOGGED ✓', {
        description: `${recipe.name} added to your tracker`,
        duration: 3000,
      });
    } catch {
      toast.error('Failed to log meal');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleFormTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(tag)
        ? prev.dietary_tags.filter((t) => t !== tag)
        : [...prev.dietary_tags, tag],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredRecipes = getFilteredRecipes();
  const totalRecipes = recipes?.length || 0;

  return (
    <div className="space-y-6">
      {/* HERO HEADER */}
      <div className="text-center py-6">
        <h1 className="font-display text-3xl sm:text-4xl tracking-wider">
          <span className="text-primary neon-glow-subtle">UNBREAKABLE</span>{' '}
          <span className="text-foreground">RECIPES</span>
        </h1>
        <p className="font-display text-xs tracking-[0.3em] text-muted-foreground mt-2">
          FUEL WITH PURPOSE • KEEP SHOWING UP
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <Badge variant="outline" className="border-primary/40 text-primary font-display text-[10px] tracking-wider">
            {totalRecipes} RECIPES
          </Badge>
          <Badge variant="outline" className="border-primary/40 text-primary font-display text-[10px] tracking-wider">
            3 PACKS
          </Badge>
        </div>
      </div>

      {/* CATEGORY TABS - Large, branded */}
      <div className="flex overflow-x-auto gap-2 pb-2 -mx-1 px-1 scrollbar-hide">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveCategory(tab.value)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-display text-sm tracking-wider whitespace-nowrap transition-all shrink-0 ${
              activeCategory === tab.value
                ? 'bg-primary text-primary-foreground neon-glow-subtle'
                : 'bg-card border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SEARCH & FILTERS ROW */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-border/60 focus:border-primary bg-card"
          />
        </div>
        
        <div className="flex gap-2 items-center w-full sm:w-auto">
          {/* Pack Filter */}
          <Select value={activePack} onValueChange={setActivePack}>
            <SelectTrigger className="w-full sm:w-[200px] border-border/60 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PACK_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={`shrink-0 ${showFilters ? 'border-primary text-primary' : 'border-border/60'}`}
          >
            <Filter className="w-4 h-4" />
          </Button>
          
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="font-display tracking-wide shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                CREATE
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display tracking-wide">CREATE RECIPE</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Recipe Name *</Label>
                  <Input
                    placeholder="e.g., High Protein Overnight Oats"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of the recipe..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Prep Time (min)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.prep_time_minutes || ''}
                      onChange={(e) => setFormData({ ...formData, prep_time_minutes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Cook Time (min)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.cook_time_minutes || ''}
                      onChange={(e) => setFormData({ ...formData, cook_time_minutes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Servings</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.servings}
                      onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Calories/serving</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.calories_per_serving || ''}
                      onChange={(e) => setFormData({ ...formData, calories_per_serving: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Protein (g)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.protein_g || ''}
                      onChange={(e) => setFormData({ ...formData, protein_g: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Carbs (g)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.carbs_g || ''}
                      onChange={(e) => setFormData({ ...formData, carbs_g: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Fat (g)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.fat_g || ''}
                      onChange={(e) => setFormData({ ...formData, fat_g: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Instructions</Label>
                  <Textarea
                    placeholder="Step by step cooking instructions..."
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label>Dietary Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dietaryTagOptions.map((tag) => (
                      <Badge
                        key={tag}
                        variant={formData.dietary_tags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleFormTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  className="w-full font-display tracking-wide"
                  onClick={handleCreateRecipe}
                  disabled={!formData.name || createRecipe.isPending}
                >
                  {createRecipe.isPending ? 'CREATING...' : 'CREATE RECIPE'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dietary Filters */}
      {showFilters && (
        <Card className="p-4 border-primary/20 neon-border-subtle">
          <p className="text-sm font-display tracking-wider text-muted-foreground mb-3">DIETARY FILTERS</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(DIETARY_TAG_MAP).map(([code, label]) => (
              <Badge
                key={code}
                variant={selectedTags.includes(code) ? 'default' : 'outline'}
                className={`cursor-pointer text-xs ${selectedTags.includes(code) ? '' : 'border-border/60 hover:border-primary/50'}`}
                onClick={() => toggleTag(code)}
              >
                {code} — {label}
                {selectedTags.includes(code) && <X className="w-3 h-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Pack header when filtering */}
      {activePack !== 'all' && activePack !== 'mine' && activePack !== 'favourites' && (
        <div className="text-center py-4 border border-primary/20 rounded-lg neon-border-subtle bg-card/50">
          <div className="flex items-center justify-center gap-2 mb-1">
            {activePack === 'low-carb' ? (
              <Leaf className="w-5 h-5 text-primary" />
            ) : activePack === '5-ingredient' ? (
              <Zap className="w-5 h-5 text-primary" />
            ) : (
              <Beef className="w-5 h-5 text-primary" />
            )}
            <h2 className="font-display text-xl tracking-wider">
              <span className="text-primary neon-glow-subtle">UNBREAKABLE </span>
              {activePack === 'low-carb' ? 'LOW-CARB PACK' : activePack === '5-ingredient' ? '5-INGREDIENT PACK' : 'HIGH PROTEIN PACK'}
            </h2>
          </div>
          <p className="text-[10px] text-muted-foreground font-display tracking-[0.2em]">
            FUEL WITH REAL INTENT • KEEP SHOWING UP
          </p>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-display tracking-wider">
          {filteredRecipes.length} {filteredRecipes.length === 1 ? 'RECIPE' : 'RECIPES'} FOUND
        </p>
      </div>

      {/* RECIPE GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes.map((recipe) => {
          const totalMacroG = (recipe.protein_g || 0) + (recipe.carbs_g || 0) + (recipe.fat_g || 0);
          const pPct = totalMacroG > 0 ? ((recipe.protein_g || 0) / totalMacroG) * 100 : 0;
          const cPct = totalMacroG > 0 ? ((recipe.carbs_g || 0) / totalMacroG) * 100 : 0;
          const fPct = totalMacroG > 0 ? ((recipe.fat_g || 0) / totalMacroG) * 100 : 0;

          return (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-all h-full neon-border-subtle overflow-hidden group"
                onClick={() => setViewingRecipe(recipe)}
              >
                {/* Recipe Image */}
                <div className="relative">
                  {recipe.image_url ? (
                    <div className="w-full h-44 overflow-hidden">
                      <img 
                        src={recipe.image_url} 
                        alt={recipe.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-muted/30 flex items-center justify-center">
                      <UtensilsCrossed className="w-10 h-10 text-muted-foreground/20" />
                    </div>
                  )}
                  {/* Pack badge floating */}
                  {recipe.pack && (
                    <Badge className="absolute top-2 left-2 text-[10px] bg-primary/90 text-primary-foreground font-display tracking-wider">
                      {recipe.pack === 'low-carb' ? '🥬 LC' : recipe.pack === '5-ingredient' ? '🔥 5-ING' : '💪 HP'}
                    </Badge>
                  )}
                  {/* Calorie badge floating */}
                  <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1">
                    <span className="font-display text-sm text-primary">{recipe.calories_per_serving || 0}</span>
                    <span className="text-[10px] text-muted-foreground ml-0.5">kcal</span>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display text-sm tracking-wide line-clamp-2 leading-tight flex-1 min-w-0 pr-2">
                      {recipe.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 -mt-0.5 -mr-2 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavourite.mutate(recipe.id);
                      }}
                    >
                      <Star className={`w-4 h-4 ${recipe.is_favourite ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>
                  
                  {/* Time + Servings */}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
                    </span>
                  </div>
                  
                  {/* Macro Bar (stacked horizontal) */}
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden flex mb-2">
                    <div className="bg-primary h-full" style={{ width: `${pPct}%` }} />
                    <div className="bg-foreground/40 h-full" style={{ width: `${cPct}%` }} />
                    <div className="bg-muted-foreground/50 h-full" style={{ width: `${fPct}%` }} />
                  </div>

                  {/* Macro Values */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div>
                      <span className="font-semibold text-primary">{recipe.protein_g || 0}g</span>
                      <span className="text-muted-foreground ml-0.5">P</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{recipe.carbs_g || 0}g</span>
                      <span className="text-muted-foreground ml-0.5">C</span>
                    </div>
                    <div>
                      <span className="font-semibold text-muted-foreground">{recipe.fat_g || 0}g</span>
                      <span className="text-muted-foreground ml-0.5">F</span>
                    </div>
                  </div>
                  
                  {/* Dietary Tags - compact */}
                  {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {recipe.dietary_tags.slice(0, 5).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-primary/30 text-primary/80">
                          {tag}
                        </Badge>
                      ))}
                      {recipe.dietary_tags.length > 5 && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-primary/30 text-primary/80">
                          +{recipe.dietary_tags.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-display tracking-wider">NO RECIPES FOUND</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
          {activePack === 'mine' && (
            <Button 
              variant="outline" 
              className="mt-4 font-display tracking-wide border-primary/40 text-primary"
              onClick={() => setShowCreateModal(true)}
            >
              CREATE YOUR FIRST RECIPE
            </Button>
          )}
        </div>
      )}

      {/* UNBREAKABLE Footer */}
      <div className="text-center py-4">
        <p className="font-display text-[10px] tracking-[0.3em] text-primary/40">
          #UNBREAKABLEMOVEMENT • LIVE WITHOUT LIMITS
        </p>
      </div>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={viewingRecipe}
        ingredients={recipeIngredients || []}
        onClose={() => setViewingRecipe(null)}
        onToggleFavourite={(id) => toggleFavourite.mutate(id)}
        onLogMeal={handleLogMeal}
      />
    </div>
  );
}
