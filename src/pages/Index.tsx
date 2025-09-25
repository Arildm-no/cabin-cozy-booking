import { useState } from 'react';
import { BookingCalendar } from '@/components/BookingCalendar';
import { BookingForm } from '@/components/BookingForm';
import { CabinInfo } from '@/components/CabinInfo';
import SuppliesList from '@/components/SuppliesList';
import LocationSelector from '@/components/LocationSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { LoginForm } from '@/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, logout } = useAuth();
  const [selectedDates, setSelectedDates] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [selectedCabin, setSelectedCabin] = useState('Blefjell');
  const [refreshCalendar, setRefreshCalendar] = useState(0);

  const handleBookingSuccess = () => {
    setSelectedDates({ from: undefined, to: undefined });
    setRefreshCalendar(prev => prev + 1);
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <h1 className="text-4xl font-bold">Family Cabin Booking</h1>
            <LocationSelector />
          </div>
          <p className="text-xl text-muted-foreground">Book your perfect cabin getaway</p>
          <div className="mt-4 flex gap-2 justify-center">
            <Link to="/admin">
              <Button variant="outline" size="sm">Admin Panel</Button>
            </Link>
            <Link to="/projects">
              <Button variant="outline" size="sm">Projects</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="booking" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="booking">Make a Booking</TabsTrigger>
            <TabsTrigger value="info">Cabin Information</TabsTrigger>
            <TabsTrigger value="supplies">Shopping List</TabsTrigger>
          </TabsList>

          <TabsContent value="booking">
            <div className="mb-6">
              <Label htmlFor="cabin-select" className="text-base font-medium">Select Cabin</Label>
              <Select value={selectedCabin} onValueChange={setSelectedCabin}>
                <SelectTrigger className="w-full max-w-xs mt-2">
                  <SelectValue placeholder="Choose a cabin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blefjell">Blefjell</SelectItem>
                  <SelectItem value="Gårdbo">Gårdbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BookingCalendar 
                key={`${refreshCalendar}-${selectedCabin}`}
                onDateSelect={setSelectedDates} 
                selectedDates={selectedDates}
                selectedCabin={selectedCabin}
              />
              <BookingForm 
                selectedDates={selectedDates} 
                selectedCabin={selectedCabin}
                onBookingSuccess={handleBookingSuccess}
              />
            </div>
          </TabsContent>

          <TabsContent value="info">
            <div className="max-w-4xl mx-auto">
              <CabinInfo />
            </div>
          </TabsContent>

          <TabsContent value="supplies">
            <div className="max-w-2xl mx-auto">
              <SuppliesList />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
