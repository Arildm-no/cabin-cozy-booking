-- Fix security warnings by setting search_path for functions
DROP FUNCTION IF EXISTS public.verify_password(text, text);
DROP FUNCTION IF EXISTS public.update_user_password(text, text);

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.verify_password(username_input text, password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT password_hash INTO stored_hash 
  FROM public.users 
  WHERE username = username_input AND is_active = true;
  
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN stored_hash = crypt(password_input, stored_hash);
END;
$$;

-- Function to update password
CREATE OR REPLACE FUNCTION public.update_user_password(username_input text, new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users 
  SET password_hash = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE username = username_input;
  
  RETURN FOUND;
END;
$$;