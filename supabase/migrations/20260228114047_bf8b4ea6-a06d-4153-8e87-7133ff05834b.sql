
-- Coaching assignments table
CREATE TABLE public.coaching_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  athlete_id uuid NOT NULL,
  assigned_by uuid,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coach_id, athlete_id)
);

ALTER TABLE public.coaching_assignments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user is coach of athlete
CREATE OR REPLACE FUNCTION public.is_coach_of(_coach_id uuid, _athlete_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coaching_assignments
    WHERE coach_id = _coach_id
      AND athlete_id = _athlete_id
      AND status = 'active'
  );
$$;

-- RLS policies for coaching_assignments

-- Coaches can see their assignments
CREATE POLICY "Coaches can view their assignments"
ON public.coaching_assignments FOR SELECT
USING (auth.uid() = coach_id OR auth.uid() = athlete_id OR is_admin_or_owner(auth.uid()));

-- Admins can create assignments
CREATE POLICY "Admins can create assignments"
ON public.coaching_assignments FOR INSERT
WITH CHECK (is_admin_or_owner(auth.uid()) OR auth.uid() = athlete_id);

-- Admins and coaches can update assignments
CREATE POLICY "Admins and coaches can update assignments"
ON public.coaching_assignments FOR UPDATE
USING (is_admin_or_owner(auth.uid()) OR auth.uid() = coach_id);

-- Admins can delete assignments
CREATE POLICY "Admins can delete assignments"
ON public.coaching_assignments FOR DELETE
USING (is_admin_or_owner(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_coaching_assignments_updated_at
  BEFORE UPDATE ON public.coaching_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
