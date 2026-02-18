
-- 1. Rename app_role enum values: owner→dev, admin→coach
ALTER TYPE public.app_role RENAME VALUE 'owner' TO 'dev';
ALTER TYPE public.app_role RENAME VALUE 'admin' TO 'coach';

-- 2. Update the is_admin_or_owner function to is_dev_or_coach
CREATE OR REPLACE FUNCTION public.is_admin_or_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('dev', 'coach')
  )
$$;

-- 3. Drop old U86 tables (cascade to remove FK constraints)
DROP TABLE IF EXISTS public.unbreakable_86_days CASCADE;
DROP TABLE IF EXISTS public.unbreakable_86_programs CASCADE;
