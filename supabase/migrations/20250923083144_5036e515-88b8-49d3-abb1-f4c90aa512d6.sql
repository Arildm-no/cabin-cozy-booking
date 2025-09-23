-- Add cabin field to bookings table
ALTER TABLE public.bookings 
ADD COLUMN cabin_name text NOT NULL DEFAULT 'Cozy';

-- Add a check constraint to ensure only valid cabin names
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_cabin_name_check 
CHECK (cabin_name IN ('Cozy', 'Gårdbo'));