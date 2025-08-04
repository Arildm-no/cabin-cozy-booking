-- Create cabin_info table to store editable cabin information
CREATE TABLE public.cabin_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cabin_info ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view cabin info" 
ON public.cabin_info 
FOR SELECT 
USING (true);

-- Insert default cabin information
INSERT INTO public.cabin_info (category, title, content, icon) VALUES
('key', 'Key Location', 'The cabin key is hidden under the flower pot next to the front door. Please make sure to return it to the same location when you leave.', 'key'),
('kitchen', 'Kitchen Supplies', 'Dish Soap: Located under the kitchen sink in the cabinet
Dishwasher: Dishwasher tablets are in the top drawer next to the sink
Cleaning: Paper towels and cleaning supplies are in the pantry
Coffee: Coffee maker and supplies are on the counter', 'utensils'),
('bathroom', 'Shower Instructions', 'Water Heater: Turn on the water heater switch in the bathroom 30 minutes before showering
Pressure: Start with low pressure and gradually increase to avoid sudden temperature changes
Towels: Fresh towels are in the linen closet next to the bathroom
After Use: Please turn off the water heater switch to save energy', 'droplets'),
('general', 'Sleeping Arrangements', 'The cabin sleeps up to 6 people with 2 bedrooms and a sofa bed in the living room. Extra blankets and pillows are in the bedroom closets.', 'bed'),
('general', 'General Guidelines', '• Please clean up after your stay and take any trash with you
• WiFi password: "CabinLife2024"
• Emergency contacts are posted on the refrigerator
• No smoking inside the cabin
• Pets are welcome but must be supervised', 'coffee');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cabin_info_updated_at
BEFORE UPDATE ON public.cabin_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();