ALTER TABLE public.saved_foods ADD COLUMN IF NOT EXISTS quantity_remaining numeric DEFAULT NULL;
ALTER TABLE public.saved_foods ADD COLUMN IF NOT EXISTS quantity_unit text DEFAULT NULL;