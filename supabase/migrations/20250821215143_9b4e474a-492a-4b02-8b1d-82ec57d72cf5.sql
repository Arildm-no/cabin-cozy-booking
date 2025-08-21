-- First, let me check if admin users exist and set up proper initial data
INSERT INTO public.admin_users (email) VALUES 
  ('Arild.Marthinsen@gmail.com'),
  ('haversand'),
  ('blefjell.family@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Add bcrypt extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update users table to use proper password hashing
ALTER TABLE public.users ALTER COLUMN password_hash SET DEFAULT NULL;

-- Insert some initial admin users if they don't exist
INSERT INTO public.users (username, password_hash) VALUES 
  ('Blefjell', crypt('Blefjell', gen_salt('bf'))),
  ('Arild', crypt('password123', gen_salt('bf'))),
  ('haversand', crypt('password123', gen_salt('bf')))
ON CONFLICT (username) DO NOTHING;

-- Function to verify password
CREATE OR REPLACE FUNCTION public.verify_password(username_input text, password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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
AS $$
BEGIN
  UPDATE public.users 
  SET password_hash = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE username = username_input;
  
  RETURN FOUND;
END;
$$;