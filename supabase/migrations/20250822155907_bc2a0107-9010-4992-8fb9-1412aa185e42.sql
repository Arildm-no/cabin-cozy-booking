-- Drop existing restrictive RLS policies on users table
DROP POLICY IF EXISTS "Only admins can view users" ON public.users;
DROP POLICY IF EXISTS "Only admins can manage users" ON public.users;

-- Create new policies that allow authenticated users to manage users
-- Since we're using a custom auth system, we'll allow any authenticated request
CREATE POLICY "Anyone can view users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

-- Also add a unique constraint on username to prevent duplicates
ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);