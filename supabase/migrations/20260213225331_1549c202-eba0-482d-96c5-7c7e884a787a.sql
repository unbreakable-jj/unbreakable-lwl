-- Fix the create_user_settings function to use NEW.user_id instead of NEW.id
-- The trigger fires on profiles table, where NEW.id is the profile row ID, not the user ID
CREATE OR REPLACE FUNCTION public.create_user_settings()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;