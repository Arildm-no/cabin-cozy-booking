-- Drop the constraint entirely first
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_cabin_name_check;

-- Update all Cozy records to Blefjell
UPDATE public.bookings 
SET cabin_name = 'Blefjell' 
WHERE cabin_name = 'Cozy';

-- Add the new constraint with Blefjell
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_cabin_name_check 
CHECK (cabin_name IN ('Blefjell', 'Gårdbo'));