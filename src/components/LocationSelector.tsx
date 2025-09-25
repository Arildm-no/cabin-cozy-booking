import { useLocation } from '@/contexts/LocationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';

const LocationSelector = () => {
  const { selectedLocation, setSelectedLocation } = useLocation();

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Blefjell">Blefjell</SelectItem>
          <SelectItem value="Gårdbo">Gårdbo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationSelector;