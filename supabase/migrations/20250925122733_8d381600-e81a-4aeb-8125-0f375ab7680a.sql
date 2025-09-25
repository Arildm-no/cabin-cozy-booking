-- Add location column to cabin_info table
ALTER TABLE public.cabin_info 
ADD COLUMN location text NOT NULL DEFAULT 'Blefjell';

-- Add location column to supplies table  
ALTER TABLE public.supplies 
ADD COLUMN location text NOT NULL DEFAULT 'Blefjell';

-- Add check constraints for valid locations
ALTER TABLE public.cabin_info 
ADD CONSTRAINT cabin_info_location_check 
CHECK (location IN ('Blefjell', 'Gårdbo'));

ALTER TABLE public.supplies 
ADD CONSTRAINT supplies_location_check 
CHECK (location IN ('Blefjell', 'Gårdbo'));

-- Update existing data to have proper location values
UPDATE public.cabin_info SET location = 'Blefjell' WHERE location IS NULL;
UPDATE public.supplies SET location = 'Blefjell' WHERE location IS NULL;