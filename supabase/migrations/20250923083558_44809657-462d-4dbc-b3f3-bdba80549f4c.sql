-- Update the check constraint to use Blefjell instead of Cozy
ALTER TABLE public.bookings 
DROP CONSTRAINT bookings_cabin_name_check;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_cabin_name_check 
CHECK (cabin_name IN ('Blefjell', 'Gårdbo'));

-- Update existing records that have 'Cozy' to 'Blefjell'
UPDATE public.bookings 
SET cabin_name = 'Blefjell' 
WHERE cabin_name = 'Cozy';