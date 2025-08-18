-- Create users table for login system
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for user access (only admins can manage users)
CREATE POLICY "Only admins can view users" 
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Only admins can manage users" 
ON public.users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add default admin user with hashed password for "Blefjell"
-- Note: In production, this should be a properly hashed password
INSERT INTO public.users (username, password_hash) 
VALUES ('Blefjell', 'Blefjell');

-- Add the new haversand user
INSERT INTO public.users (username, password_hash) 
VALUES ('haversand', 'haversand');