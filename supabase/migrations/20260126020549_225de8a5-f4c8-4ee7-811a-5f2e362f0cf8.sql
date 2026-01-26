-- Create meal_plans table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal_plan_items table for individual meals in a plan
CREATE TABLE public.meal_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  recipe_id UUID,
  food_name TEXT,
  calories INTEGER,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  servings NUMERIC DEFAULT 1,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER DEFAULT 1,
  calories_per_serving INTEGER,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  dietary_tags TEXT[],
  image_url TEXT,
  is_public BOOLEAN DEFAULT false,
  is_favourite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipe_ingredients table
CREATE TABLE public.recipe_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  food_id UUID,
  name TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  calories INTEGER,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  sort_order INTEGER DEFAULT 0
);

-- Create food_logs table for daily tracking
CREATE TABLE public.food_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT,
  servings NUMERIC DEFAULT 1,
  serving_size TEXT,
  calories INTEGER NOT NULL,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  fiber_g NUMERIC,
  sugar_g NUMERIC,
  sodium_mg NUMERIC,
  notes TEXT,
  recipe_id UUID REFERENCES public.recipes(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_foods table for user's frequently used foods
CREATE TABLE public.saved_foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  food_name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT,
  serving_size TEXT,
  calories INTEGER NOT NULL,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  fiber_g NUMERIC,
  sugar_g NUMERIC,
  sodium_mg NUMERIC,
  is_favourite BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nutrition_goals table
CREATE TABLE public.nutrition_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  daily_calories INTEGER,
  daily_protein_g INTEGER,
  daily_carbs_g INTEGER,
  daily_fat_g INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for meal_plans
CREATE POLICY "Users can view their own meal plans" ON public.meal_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own meal plans" ON public.meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meal plans" ON public.meal_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meal plans" ON public.meal_plans FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for meal_plan_items
CREATE POLICY "Users can view their own meal plan items" ON public.meal_plan_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own meal plan items" ON public.meal_plan_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meal plan items" ON public.meal_plan_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meal plan items" ON public.meal_plan_items FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for recipes
CREATE POLICY "Users can view public recipes or their own" ON public.recipes FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create their own recipes" ON public.recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recipes" ON public.recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recipes" ON public.recipes FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for recipe_ingredients
CREATE POLICY "Users can view ingredients of visible recipes" ON public.recipe_ingredients FOR SELECT USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND (is_public = true OR user_id = auth.uid())));
CREATE POLICY "Users can create ingredients for their recipes" ON public.recipe_ingredients FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can update ingredients for their recipes" ON public.recipe_ingredients FOR UPDATE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete ingredients for their recipes" ON public.recipe_ingredients FOR DELETE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));

-- RLS policies for food_logs
CREATE POLICY "Users can view their own food logs" ON public.food_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own food logs" ON public.food_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own food logs" ON public.food_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own food logs" ON public.food_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for saved_foods
CREATE POLICY "Users can view their own saved foods" ON public.saved_foods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own saved foods" ON public.saved_foods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own saved foods" ON public.saved_foods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved foods" ON public.saved_foods FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for nutrition_goals
CREATE POLICY "Users can view their own nutrition goals" ON public.nutrition_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own nutrition goals" ON public.nutrition_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own nutrition goals" ON public.nutrition_goals FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON public.meal_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_saved_foods_updated_at BEFORE UPDATE ON public.saved_foods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nutrition_goals_updated_at BEFORE UPDATE ON public.nutrition_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();