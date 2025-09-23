-- First update existing records, then update the constraint
UPDATE public.bookings 
SET cabin_name = 'Blefjell' 
WHERE cabin_name = 'Cozy';

-- Now safely update the constraint
ALTER TABLE public.bookings 
DROP CONSTRAINT bookings_cabin_name_check;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_cabin_name_check 
CHECK (cabin_name IN ('Blefjell', 'Gårdbo'));