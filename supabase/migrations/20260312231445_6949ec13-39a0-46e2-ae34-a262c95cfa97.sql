
-- Enable pgcrypto for bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Hash all existing plaintext passwords using bcrypt
UPDATE public.users SET password_hash = crypt(password_hash, gen_salt('bf'));

-- Drop overly permissive policies on bookings
DROP POLICY IF EXISTS "Admins can do everything on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;

-- Drop overly permissive policies on users
DROP POLICY IF EXISTS "Anyone can manage users" ON public.users;
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;

-- Drop overly permissive policies on admin_users
DROP POLICY IF EXISTS "Authenticated users can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Only authenticated users can view admin users" ON public.admin_users;

-- Drop overly permissive policies on supplies
DROP POLICY IF EXISTS "Admins can manage supplies" ON public.supplies;

-- Drop overly permissive policies on cabin_info (add write policies)
-- cabin_info currently has no write policies which is fine for anon, but we need service role to write

-- Bookings: anon can only SELECT approved and INSERT new
-- (keep existing "Anyone can view approved bookings" and "Anyone can create bookings")

-- Users: no public access at all (only service role via edge functions)
-- No policies needed - RLS enabled means no access

-- Admin_users: no public access
-- No policies needed

-- Supplies: public can only read
-- (keep existing "Anyone can view supplies")

-- Update verify_password to use bcrypt
CREATE OR REPLACE FUNCTION public.verify_password(username_input text, password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT password_hash INTO stored_hash 
  FROM public.users 
  WHERE LOWER(username) = LOWER(username_input) AND is_active = true;
  
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN stored_hash = crypt(password_input, stored_hash);
END;
$$;

-- Update update_user_password to hash with bcrypt
CREATE OR REPLACE FUNCTION public.update_user_password(username_input text, new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.users 
  SET password_hash = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE username = username_input;
  
  RETURN FOUND;
END;
$$;
