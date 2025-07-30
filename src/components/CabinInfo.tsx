import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Key, Droplets, Utensils, Bed, Coffee } from 'lucide-react';

export const CabinInfo = () => {
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
            <TabsTrigger value="key">Key</TabsTrigger>
            <TabsTrigger value="kitchen">Kitchen</TabsTrigger>
            <TabsTrigger value="bathroom">Bathroom</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>
          
          <TabsContent value="key" className="space-y-4">
            <div className="flex items-start gap-3">
              <Key className="h-5 w-5 mt-1 text-primary" />
              <div>
                <h3 className="font-semibold mb-2">Key Location</h3>
                <p className="text-sm text-muted-foreground">
                  The cabin key is hidden under the flower pot next to the front door. 
                  Please make sure to return it to the same location when you leave.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="kitchen" className="space-y-4">
            <div className="flex items-start gap-3">
              <Utensils className="h-5 w-5 mt-1 text-primary" />
              <div>
                <h3 className="font-semibold mb-2">Kitchen Supplies</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Dish Soap:</strong> Located under the kitchen sink in the cabinet</p>
                  <p><strong>Dishwasher:</strong> Dishwasher tablets are in the top drawer next to the sink</p>
                  <p><strong>Cleaning:</strong> Paper towels and cleaning supplies are in the pantry</p>
                  <p><strong>Coffee:</strong> Coffee maker and supplies are on the counter</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="bathroom" className="space-y-4">
            <div className="flex items-start gap-3">
              <Droplets className="h-5 w-5 mt-1 text-primary" />
              <div>
                <h3 className="font-semibold mb-2">Shower Instructions</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Water Heater:</strong> Turn on the water heater switch in the bathroom 30 minutes before showering</p>
                  <p><strong>Pressure:</strong> Start with low pressure and gradually increase to avoid sudden temperature changes</p>
                  <p><strong>Towels:</strong> Fresh towels are in the linen closet next to the bathroom</p>
                  <p><strong>After Use:</strong> Please turn off the water heater switch to save energy</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Bed className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h3 className="font-semibold mb-2">Sleeping Arrangements</h3>
                  <p className="text-sm text-muted-foreground">
                    The cabin sleeps up to 6 people with 2 bedrooms and a sofa bed in the living room.
                    Extra blankets and pillows are in the bedroom closets.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Coffee className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h3 className="font-semibold mb-2">General Guidelines</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Please clean up after your stay and take any trash with you</p>
                    <p>• WiFi password: "CabinLife2024"</p>
                    <p>• Emergency contacts are posted on the refrigerator</p>
                    <p>• No smoking inside the cabin</p>
                    <p>• Pets are welcome but must be supervised</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};