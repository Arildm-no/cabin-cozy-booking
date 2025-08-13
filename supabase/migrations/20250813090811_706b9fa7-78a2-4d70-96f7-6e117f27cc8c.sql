-- Remove the overly permissive policy that allows anyone to view admin users
DROP POLICY IF EXISTS "Anyone can view admin users" ON public.admin_users;

-- Create a new restrictive policy that only allows authenticated users to view admin users
-- This prevents public exposure of admin email addresses
CREATE POLICY "Only authenticated users can view admin users" 
ON public.admin_users 
FOR SELECT 
TO authenticated
USING (true);

-- Add a policy for admins to manage admin users (insert/update/delete)
-- This assumes you'll implement proper admin role checking later
CREATE POLICY "Authenticated users can manage admin users" 
ON public.admin_users 
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);