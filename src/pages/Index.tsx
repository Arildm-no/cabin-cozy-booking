import { useState, useMemo } from 'react';
import { BookingCalendar } from '@/components/BookingCalendar';
import { BookingForm } from '@/components/BookingForm';
import { CabinInfo } from '@/components/CabinInfo';
import SuppliesList from '@/components/SuppliesList';
import LocationSelector from '@/components/LocationSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LoginForm } from '@/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/contexts/LocationContext';
import { useSeason } from '@/hooks/useSeason';
import { LogOut } from 'lucide-react';
import blefjellSummer from '@/assets/blefjell-summer.jpg';
import blefjellWinter from '@/assets/blefjell-winter.jpg';
import gardboSummer from '@/assets/gardbo-summer.jpg';
import gardboWinter from '@/assets/gardbo-winter.jpg';

const Index = () => {
  const { isAuthenticated, logout } = useAuth();
  const { selectedLocation } = useLocation();
  const season = useSeason();
  const [selectedDates, setSelectedDates] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [refreshCalendar, setRefreshCalendar] = useState(0);

  const handleBookingSuccess = () => {
    setSelectedDates({ from: undefined, to: undefined });
    setRefreshCalendar(prev => prev + 1);
  };

  // Determine background image based on location and season
  const backgroundImage = useMemo(() => {
    if (selectedLocation === 'Blefjell') {
      return season === 'summer' ? blefjellSummer : blefjellWinter;
    } else {
      return season === 'summer' ? gardboSummer : gardboWinter;
    }
  }, [selectedLocation, season]);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto py-8 px-4">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BookingCalendar 
                key={refreshCalendar}
                onDateSelect={setSelectedDates} 
                selectedDates={selectedDates}
              />
              <BookingForm 
                selectedDates={selectedDates} 
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
