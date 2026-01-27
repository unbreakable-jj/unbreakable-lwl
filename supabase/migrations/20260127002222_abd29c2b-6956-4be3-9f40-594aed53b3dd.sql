-- Private coaching bio fields (NOT public profile)
CREATE TABLE IF NOT EXISTS public.coaching_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  age_years INTEGER NULL,
  height_cm NUMERIC NULL,
  weight_kg NUMERIC NULL,
  preferred_height_unit TEXT NOT NULL DEFAULT 'cm',
  preferred_weight_unit TEXT NOT NULL DEFAULT 'kg',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT coaching_profiles_age_range CHECK (age_years IS NULL OR (age_years >= 0 AND age_years <= 120)),
  CONSTRAINT coaching_profiles_height_range CHECK (height_cm IS NULL OR (height_cm >= 30 AND height_cm <= 300)),
  CONSTRAINT coaching_profiles_weight_range CHECK (weight_kg IS NULL OR (weight_kg >= 20 AND weight_kg <= 400)),
  CONSTRAINT coaching_profiles_height_unit_chk CHECK (preferred_height_unit IN ('cm', 'ft_in')),
  CONSTRAINT coaching_profiles_weight_unit_chk CHECK (preferred_weight_unit IN ('kg', 'lb'))
);

ALTER TABLE public.coaching_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='coaching_profiles' AND policyname='Users can view their own coaching profile'
  ) THEN
    CREATE POLICY "Users can view their own coaching profile"
    ON public.coaching_profiles
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='coaching_profiles' AND policyname='Users can insert their own coaching profile'
  ) THEN
    CREATE POLICY "Users can insert their own coaching profile"
    ON public.coaching_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='coaching_profiles' AND policyname='Users can update their own coaching profile'
  ) THEN
    CREATE POLICY "Users can update their own coaching profile"
    ON public.coaching_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='coaching_profiles' AND policyname='Users can delete their own coaching profile'
  ) THEN
    CREATE POLICY "Users can delete their own coaching profile"
    ON public.coaching_profiles
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_coaching_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_coaching_profiles_updated_at
    BEFORE UPDATE ON public.coaching_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_coaching_profiles_user_id ON public.coaching_profiles(user_id);
