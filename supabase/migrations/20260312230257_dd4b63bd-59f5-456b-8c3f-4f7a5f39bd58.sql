CREATE OR REPLACE FUNCTION public.verify_password(username_input text, password_input text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  stored_password text;
BEGIN
  SELECT password_hash INTO stored_password 
  FROM public.users 
  WHERE LOWER(username) = LOWER(username_input) AND is_active = true;
  
  IF stored_password IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN stored_password = password_input;
END;
$function$;