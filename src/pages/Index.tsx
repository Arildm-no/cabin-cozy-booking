import { useState } from 'react';
import { BookingCalendar } from '@/components/BookingCalendar';
import { BookingForm } from '@/components/BookingForm';
import { CabinInfo } from '@/components/CabinInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [selectedDates, setSelectedDates] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [refreshCalendar, setRefreshCalendar] = useState(0);

  const handleBookingSuccess = () => {
    setSelectedDates({ from: undefined, to: undefined });
    setRefreshCalendar(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Family Cabin Booking</h1>
          <p className="text-xl text-muted-foreground">Book your perfect cabin getaway</p>
        </div>

        <Tabs defaultValue="booking" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="booking">Make a Booking</TabsTrigger>
            <TabsTrigger value="info">Cabin Information</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
