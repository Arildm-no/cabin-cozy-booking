-- Fix function search path security issues
DROP FUNCTION public.update_updated_at_column();
DROP FUNCTION public.check_booking_conflicts();

-- Recreate functions with proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';