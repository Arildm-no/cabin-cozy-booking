import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShoppingCart } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';

interface Supply {
  id: string;
  item_name: string;
  notes: string | null;
  is_urgent: boolean;
  created_at: string;
}

const SuppliesList = () => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedLocation } = useLocation();

  useEffect(() => {
    fetchSupplies();
  }, [selectedLocation]);

  const fetchSupplies = async () => {
    try {
      const { data, error } = await supabase
        .from('supplies' as any)
        .select('*')
        .eq('location', selectedLocation)
        .order('is_urgent', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSupplies((data as unknown as Supply[]) || []);
    } catch (error) {
      console.error('Error fetching supplies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (supplies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">All supplies are stocked! 🎉</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Shopping List ({supplies.length} items)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {supplies.map((supply) => (
            <div key={supply.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{supply.item_name}</h4>
                  {supply.is_urgent && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Urgent
                    </Badge>
                  )}
                </div>
                {supply.notes && (
                  <p className="text-sm text-muted-foreground">{supply.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SuppliesList;