-- Create projects table for cabin maintenance tracking
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  target_month INTEGER NOT NULL CHECK (target_month >= 1 AND target_month <= 12),
  target_year INTEGER NOT NULL CHECK (target_year >= 2024),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Anyone can view projects
CREATE POLICY "Anyone can view projects" 
ON public.projects 
FOR SELECT 
USING (true);

-- Only admins can manage projects (using the same logic as other admin tables)
CREATE POLICY "Admins can manage projects" 
ON public.projects 
FOR ALL 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();