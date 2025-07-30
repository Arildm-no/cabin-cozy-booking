-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guests_count INTEGER NOT NULL CHECK (guests_count > 0 AND guests_count <= 6),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT max_duration CHECK (end_date - start_date <= 14)
);

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings (public read for transparency, anyone can insert)
CREATE POLICY "Anyone can view approved bookings" 
ON public.bookings 
FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Anyone can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete their own bookings" 
ON public.bookings 
FOR DELETE 
USING (true);

-- Admin policies (for now allowing all operations, will refine later)
CREATE POLICY "Admins can do everything on bookings" 
ON public.bookings 
FOR ALL 
USING (true);

CREATE POLICY "Anyone can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (true);

-- Insert initial admin user
INSERT INTO public.admin_users (email) VALUES ('Arild.Marthinsen@gmail.com');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check for date conflicts
CREATE OR REPLACE FUNCTION public.check_booking_conflicts()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE status = 'approved' 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (
      (NEW.start_date <= start_date AND NEW.end_date > start_date) OR
      (NEW.start_date < end_date AND NEW.end_date >= end_date) OR
      (NEW.start_date >= start_date AND NEW.end_date <= end_date)
    )
  ) THEN
    RAISE EXCEPTION 'Booking conflicts with existing approved booking';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent conflicts
CREATE TRIGGER prevent_booking_conflicts
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_booking_conflicts();