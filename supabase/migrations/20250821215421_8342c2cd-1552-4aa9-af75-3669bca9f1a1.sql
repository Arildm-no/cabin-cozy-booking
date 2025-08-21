-- Create function to hash password before insert
CREATE OR REPLACE FUNCTION public.hash_password_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only hash if password_hash is not already hashed (doesn't start with $2)
  IF NEW.password_hash IS NOT NULL AND NOT (NEW.password_hash LIKE '$2%') THEN
    NEW.password_hash = crypt(NEW.password_hash, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for password hashing on insert
CREATE TRIGGER hash_password_before_insert
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.hash_password_trigger();

-- Create trigger for password hashing on update (only if password_hash changes)
CREATE TRIGGER hash_password_before_update
  BEFORE UPDATE OF password_hash ON public.users
  FOR EACH ROW
  WHEN (OLD.password_hash IS DISTINCT FROM NEW.password_hash)
  EXECUTE FUNCTION public.hash_password_trigger();