-- Update the default value for cabin_name to Blefjell
ALTER TABLE public.bookings 
ALTER COLUMN cabin_name SET DEFAULT 'Blefjell';