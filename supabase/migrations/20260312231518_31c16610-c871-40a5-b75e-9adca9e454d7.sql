
CREATE OR REPLACE FUNCTION public.create_user_with_hash(username_input text, password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.users (username, password_hash)
  VALUES (username_input, crypt(password_input, gen_salt('bf')));
  RETURN true;
END;
$$;
