import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Key, Droplets, Utensils, Bed, Coffee } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from '@/contexts/LocationContext';

interface CabinInfo {
  id: string;
  category: string;
  title: string;
  content: string;
  icon: string;
}

const iconMap = {
  key: Key,
  droplets: Droplets,
  utensils: Utensils,
  bed: Bed,
  coffee: Coffee,
};

export const CabinInfo = () => {
  const [cabinInfo, setCabinInfo] = useState<CabinInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedLocation } = useLocation();

  useEffect(() => {
    fetchCabinInfo();
  }, [selectedLocation]);

  const fetchCabinInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('cabin_info')
        .select('*')
        .eq('location', selectedLocation)
        .order('category');

      if (error) throw error;
      setCabinInfo(data || []);
    } catch (error) {
      console.error('Error fetching cabin info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItemsByCategory = (category: string) => {
    return cabinInfo.filter(item => item.category === category);
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || MapPin;
    return <IconComponent className="h-5 w-5 mt-1 text-primary" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Cabin Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading cabin information...</div>
        </CardContent>
      </Card>
    );
  }

  const categories = [
    { key: 'key', label: 'Key' },
    { key: 'kitchen', label: 'Kitchen' },
    { key: 'bathroom', label: 'Bathroom' },
    { key: 'general', label: 'General' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Cabin Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="key" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {categories.map(category => (
              <TabsTrigger key={category.key} value={category.key}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category.key} value={category.key} className="space-y-4">
              {getItemsByCategory(category.key).map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  {renderIcon(item.icon)}
                  <div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {item.content}
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};