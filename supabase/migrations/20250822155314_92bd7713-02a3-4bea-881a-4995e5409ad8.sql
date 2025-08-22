-- Drop triggers first
DROP TRIGGER IF EXISTS hash_password_before_insert ON public.users;
DROP TRIGGER IF EXISTS hash_password_before_update ON public.users;

-- Now drop the function
DROP FUNCTION IF EXISTS public.hash_password_trigger();

-- Drop the existing verification functions
DROP FUNCTION IF EXISTS public.verify_password(text, text);
DROP FUNCTION IF EXISTS public.update_user_password(text, text);

-- Create a simple verification function that works with plain text passwords for now
CREATE OR REPLACE FUNCTION public.verify_password(username_input text, password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_password text;
BEGIN
  SELECT password_hash INTO stored_password 
  FROM public.users 
  WHERE username = username_input AND is_active = true;
  
  IF stored_password IS NULL THEN
    RETURN false;
  END IF;
  
  -- Simple text comparison for now
  RETURN stored_password = password_input;
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
  SET password_hash = new_password,
      updated_at = now()
  WHERE username = username_input;
  
  RETURN FOUND;
END;
$$;

-- Update existing users with plain text passwords
UPDATE public.users SET password_hash = 'Blefjell' WHERE username = 'Blefjell';
UPDATE public.users SET password_hash = 'password123' WHERE username = 'Arild';  
UPDATE public.users SET password_hash = 'password123' WHERE username = 'haversand';